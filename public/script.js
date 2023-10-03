// public/script.js
const uploadForm = document.getElementById('uploadForm');
const fetchDataButton = document.getElementById('fetchDataButton');
const dataTable = document.getElementById('dataTable');
const loadingFeedback = document.getElementById('loadingFeedback');
const downloadFeedback = document.getElementById('downloadFeedback');

uploadForm.addEventListener('submit', handleUpload);
fetchDataButton.addEventListener('click', fetchData);

function handleUpload(event) {
  event.preventDefault();
  
  // Show loading feedback
  loadingFeedback.classList.remove('hidden');
  downloadFeedback.classList.add('hidden'); // Hide download feedback if it's visible

  const formData = new FormData(uploadForm);
  fetch('/upload', {
    method: 'POST',
    body: formData,
  })
  .then(response => {
    if (response.redirected) {
      window.location.href = response.url;
      // Hide loading feedback and show download feedback when the file is downloaded
      loadingFeedback.classList.add('hidden');
      downloadFeedback.classList.remove('hidden');
    } else {
      throw new Error('Failed to upload Excel sheet.');
    }
  })
  .catch(error => {
    console.error('Error uploading Excel sheet:', error);
    loadingFeedback.classList.add('hidden'); // Hide loading feedback in case of an error
  });
}

function fetchData() {
  loadingFeedback.classList.remove('hidden'); // Show loading feedback when fetching data
  downloadFeedback.classList.add('hidden'); // Hide download feedback if it's visible

  fetch('/data')
    .then(response => response.json())
    .then(data => {
      // Clear existing table data
      dataTable.innerHTML = '';

      // Create table headers
      const headers = ['Customer Name', 'Species Name', 'Sequencing ID', 'Kit Type', 'Name', 'Date', 'iLabID', 'Run Folder', 'Run Type'];
      const headerRow = dataTable.insertRow();
      headers.forEach(headerText => {
        const headerCell = document.createElement('th');
        headerCell.textContent = headerText;
        headerRow.appendChild(headerCell);
      });

      // Populate table with fetched data
      data.forEach(rowData => {
        const dataRow = dataTable.insertRow();
        const dataCells = [rowData.customerName, rowData.speciesName, rowData.sequencingID, rowData.kitType, rowData.name, rowData.date, rowData.iLabID, rowData.runFolder, rowData.runType];
        dataCells.forEach(cellText => {
          const dataCell = document.createElement('td');
          dataCell.textContent = cellText;
          dataRow.appendChild(dataCell);
        });
      });

      // Hide loading feedback after data is fetched
      loadingFeedback.classList.add('hidden');
    })
    .catch(error => {
      console.error('Error fetching data:', error);
      loadingFeedback.classList.add('hidden'); // Hide loading feedback in case of an error
    });
}
