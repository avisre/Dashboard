

// server.js
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const XLSX = require('xlsx');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

mongoose.connect('mongodb+srv://project:project@cluster0.kos1k7l.mongodb.net/excelData', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const ExcelData = mongoose.model('ExcelData', {
  customerName: String,
  speciesName: String,
  sequencingID: String,
  kitType: String,
  name: String,
  date: Date,
  iLabID: String,
  runFolder: String,
  runType: String,
});

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.post('/upload', upload.single('file'), (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      throw new Error('No file uploaded.');
    }

    const workbook = XLSX.readFile(file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const sheet2 = workbook.Sheets[workbook.SheetNames[1]];

    // Extract data from the sheet (modify these indices based on your Excel structure)
    const customerName = sheet['D5']?.v || '';
    const speciesName = sheet['I5']?.v || '';
    const sequencingID = sheet['J1']?.v || '';
    const kitType = sheet['F1']?.v || '';
    const name = sheet['M1']?.v || '';
    const date = sheet['M2']?.w || '';
    const iLabID = sheet['D5']?.v || '';
    const runFolder = sheet2['B1']?.v || '';
    const runType = sheet2['B2']?.v || '';

    const excelData = new ExcelData({
      customerName,
      speciesName,
      sequencingID,
      kitType,
      name,
      date,
      iLabID,
      runFolder,
      runType,
    });

    excelData.save()
      .then(savedData => {
        console.log('Excel data saved to MongoDB:', savedData);
        res.redirect('/');
      })
      .catch(error => {
        console.error('Error saving Excel data:', error);
        res.status(500).send('Internal Server Error');
      });
  } catch (error) {
    console.error('Error processing uploaded file:', error);
    res.status(400).send('Bad Request: Invalid file format or structure.');
  }
});




app.get('/data', async (req, res) => {
 
  try {
    const data = await ExcelData.find({})
      res.json(data);
  } catch (error) {
    console.error('Error retrieving data from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
