# Receipt Tracker App

## Overview
The Receipt Tracker App is a web application that allows users to scan receipts, extract relevant data using Optical Character Recognition (OCR), and track their monthly spending. Users can upload receipt images, view detailed information about each receipt, and analyze their spending patterns over time.

## Features
- Upload receipt images and extract data such as price, date, and type of receipt using OCR.
- Store extracted data in a SQLite database.
- User-friendly interface for tracking monthly spending.
- View detailed receipt information, including the uploaded image.
- Simple CRUD functionality for managing receipts.

## Project Structure
```
receipt-tracker-app
├── app
│   ├── __init__.py
│   ├── routes.py
│   ├── models.py
│   ├── ocr.py
│   ├── static
│   │   └── styles.css
│   ├── templates
│   │   ├── index.html
│   │   ├── add_receipt.html
│   │   └── receipt_detail.html
│   └── uploads
├── instance
│   └── receipts.db
├── requirements.txt
└── README.md
```

## Installation
1. Clone the repository:
   ```
   git clone <repository-url>
   cd receipt-tracker-app
   ```

2. Create a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```

3. Install the required dependencies:
   ```
   pip install -r requirements.txt
   ```

## Usage
1. Run the application:
   ```
   flask run
   ```

2. Open your web browser and navigate to `http://127.0.0.1:5000`.

3. Use the interface to upload receipts, view spending data, and access detailed receipt information.

## Receipt OCR Tracker (JavaScript)

This is a pure JavaScript web app using tesseract.js in the browser for OCR. No backend required.

## Usage
1. Open `index.html` in your browser.
2. Upload a receipt image.
3. The app will extract text, price, date, and type (food/transport/other) from the image.

## Dependencies
- [tesseract.js v5](https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js) (CDN)

## Contributing
Contributions are welcome! Please submit a pull request or open an issue for any suggestions or improvements.

## License
This project is licensed under the MIT License.