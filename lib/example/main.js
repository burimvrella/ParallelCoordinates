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
            selected_features = getSelectedFeatures();
            parcoords.setFeatures(selected_features);
            parcoords.generateSVG();
        };

        reader.readAsText(file);
    }
}

function updateDimensions()
{
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

function clearPlot() {
    const parentElement = document.getElementById('parallelcoords');

    while (parentElement.firstChild) {
        parentElement.removeChild(parentElement.firstChild);
    }
}

function changeDimensionColor() {
    const dimension = document.getElementById('dimension');
    var data = parcoords.getData()
    var features = data["columns"]
    if(features.includes(dimension.value)){
        parcoords.select(dimension.value) 
    }else{
        dimension.innerHTML = "<br>" + dimension.value + "is not valid"
    }

}

function getDimensionPos() {
    const dimension = document.getElementById('dimensionPos');
    var data = parcoords.getData()
    var features = data["columns"]
    if(features.includes(dimension.value)){
        var pos = parcoords.getDimensionPositions(dimension.value)  
        const info = document.getElementById('infopos');
        info.innerHTML = "<br>" + dimension.value + " position is: " + (pos.indexOf(dimension.value) + 1)
    }
    else{
        const error = document.getElementById('errorpos');
        error.innerHTML = "<br>" + dimension.value + "is not valid"
    }
}
