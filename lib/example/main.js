var parcoords = new SteerableParcoords();
var data;

function openFileDialog() {
    document.getElementById('fileInput').click();
}

function handleFileSelect(event) {
    const file = event.target.files[0];

    if (file) {
        const reader = new FileReader();

        reader.onload = function(e) {
            clearPlot();
            data = e.target.result;
            parcoords.loadCSV(data);
            selectFeatures();
            generateInvertButtons();
            selected_features = getSelectedFeatures();
            parcoords.setFeatures(selected_features);
            parcoords.generateSVG();
        };

        reader.readAsText(file);
    }
}

function invertMaths()
{
    console.log("invert maths");
    parcoords.invert("Maths");
}

function updateDimensions()
{
    selected_features = getSelectedFeatures();
    parcoords.setFeatures(selected_features);
    parcoords.generateSVG();
    console.log("update dimensions");
}

function getSelectedFeatures()
{
    const checkboxes = document.querySelectorAll('input[name="feature"]:checked');
    const checkedFeatures = [];

    checkboxes.forEach(function(checkbox) {
        checkedFeatures.push(checkbox.value);
    });

    return checkedFeatures;
}

function selectFeatures(){
  var data = parcoords.getData()
  var features = data["columns"];

    const container = document.getElementById('checkboxContainer');

    features.forEach(function(feature) {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.name = 'feature';
        checkbox.value = feature;
        checkbox.checked = true;

        checkbox.addEventListener('change', updateDimensions);

        const label = document.createElement('label');
        label.appendChild(document.createTextNode(feature));

        container.appendChild(checkbox);
        container.appendChild(label);
    });
}

function generateInvertButtons()
{
    var data = parcoords.getData()
    var features = data["columns"];

    const container = document.getElementById('invert_container');

    features.forEach(function(feature) {
        const button = document.createElement('input');
        button.type = 'button';
        button.name = 'feature';
        button.value = feature;
        button.className = 'button';
        button.onclick = () => parcoords.invert(feature);
        container.appendChild(button);
    });
}


function clearPlot() {
    const parentElement = document.getElementById('parallelcoords');

    while (parentElement.firstChild) {
        parentElement.removeChild(parentElement.firstChild);
    }
}

