from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
import PyPDF2
import io
import os
from google import genai

app = Flask(__name__)
CORS(app)

# Configure the Google Gemini API key from the environment variable
client = genai.Client(api_key="AIzaSyCrFqdIPZnSsvJJvsL7vcUe7weTFehnGLQ")



@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    if not file.filename.lower().endswith('.pdf'):
        return jsonify({'error': 'Invalid file type.  Must be a PDF.'}), 400

    try:
        pdf_reader = PyPDF2.PdfReader(file)
        text = ""
        for page_num in range(len(pdf_reader.pages)):
            page = pdf_reader.pages[page_num]
            text += page.extract_text()

        # Construct the prompt for Gemini
        prompt = "Briefly summarize the key points of this document:\n\n" + text
        model = "gemini-2.0-flash"

        response = client.models.generate_content(
            model=model,
            contents=prompt,
        )


        # Create a text file in memory with the *summary*
        text_file = io.BytesIO()
        text_file.write(response.text.encode('utf-8'))  # Write the summary
        text_file.seek(0)

        base_filename = os.path.splitext(file.filename)[0]
        txt_filename = base_filename + ".txt"
        return send_file(text_file, as_attachment=True, download_name=txt_filename, mimetype='text/plain')

    except Exception as e:
        print(f"An exception occurred: {e}")
        return jsonify({'error': f'Error processing PDF or interacting with Gemini: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True)