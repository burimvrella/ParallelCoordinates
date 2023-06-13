const width = 1200, height = 400, padding = 50, brush_width = 20;
var filters = {}

const myForm = document.getElementById("uploadFile");
const csvFile = document.getElementById("file");
const selectfeatures = document.getElementById("selectfeaturs");
const choosenfeatures = document.getElementById("choosenfeatures");
var selectedstudent = document.getElementById("selectedstudent");
var submitdata = document.getElementById("submit");


//Load Date from CSV file and calls the GenarateSVG
myForm.addEventListener("submit", function (e) {
  if(selectfeatures.childElementCount < 1){
    submitdata.disabled = false;
  }
  else{
    submitdata.disabled = true;
  }
  e.preventDefault();
  const input = csvFile.files[0];
  const reader = new FileReader();

  reader.onload = function (e) {
    const text = e.target.result;
    const data = d3.csvParse(text);
    SelectFeatures(data.sort((a,b) => a.Name.toLowerCase() > b.Name.toLowerCase() ? 1 : -1));
    };
  reader.readAsText(input);
});

const element = document.getElementById("delete");
element.addEventListener("click", function() {
  d3.select("#parallelcoords").select("svg").remove();
  selectedstudent.innerHTML = " ";
  filters = []
  newfeatures = []
  var get= document.getElementsByName('features');
  for(var i= 0; i < get.length; i++){
    get[i].checked= false;
  }  
  choosenfeatures.disabled = false;
});


var newfeatures = []
function SelectFeatures(data){
  var features = [];
    data["columns"].forEach(element => {
        features.push({"feature" : element})
    });

    features.forEach(feature =>{
      var checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.name =  "features";
      checkbox.value = feature.feature;
      checkbox.id = feature.feature;

      var label = document.createElement('label');
      label.htmlFor = feature.feature;    
      label.appendChild(document.createTextNode(feature.feature));

      selectfeatures.appendChild(checkbox);
      selectfeatures.appendChild(label);
    });

    choosenfeatures.addEventListener("click", function() {
        const cb = document.querySelectorAll('input[name="features"]:checked');
        var error = document.getElementById("error");
        if(cb.length < 2)
        {
          error.innerHTML = "<span style='color: red;'>"+
          "Please enter a valid number</span>";
        }else {
          error.innerHTML = "";
          cb.forEach(selectedfeature => {
            newfeatures.push(selectedfeature.value);
          });
          choosenfeatures.disabled = true;
          GenarateSVG(data,newfeatures);
        }
    });
} 

function GenarateSVG(data, newfeatures){

  var features = [];
  var newdataset = [];
  data.forEach(obj => {
    var newdata = {};
    newfeatures.forEach(feature =>{
      newdata[feature] = obj[feature]
    })
    newdataset.push(newdata)
  })

  temp = Object.keys(newdataset[0])
  temp.forEach(element => features.push({'name' : element}))

  var xScales = d3.scalePoint()
      .range([width-padding,padding])
      .domain(features.map(x => x.name))
    
  var yScales = {};
      features.map(x => {
  
        if(x.name === "Name") {
          yScales[x.name] = d3.scalePoint()
          .domain(newdataset.map(function(d) { return d.Name; })) 
          .range([padding,height-padding])
        }
        else{
          if(x.name === "Maths")
          {
            yScales[x.name] = d3.scaleLinear()
            //hier to invert
            .domain([0,100])
            .range([padding,height-padding])
          }
          else{
            yScales[x.name] = d3.scaleLinear()
            //hier to invert
            .domain([0,100])
            .range([height-padding,padding])
          }
        }
      })
      
      var yAxis = {};
      var yaxis = Object.entries(yScales).map(x => {
        if(x[0] === "Name"){
          yAxis[x[0]] = d3.axisRight(x[1])
        }else{
          yAxis[x[0]] = d3.axisLeft(x[1])
        }  
      })


      //TODO fix this 
      const brusheventHandler = function(features){
        console.log(features)
        if(features.sourceEvent && features.sourceEvent.type === 'zoom')
          return;
          if(features === 'Name'){
            return;
          }
        if(d3.selection != null){
          filters[features] = d3.selection.map(d => yScales[features].invert(d))
        } else{
          if(features in filters)
            delete(filters[features])
        }
        applyFilters()
      }
    
      const applyFilters = function(){
        d3.select('g.active').selectAll('path')
          .style('display', d => (selected(d) ? null : 'none'))
      }
    
      const selected = function(d){
        const tempFilters = Object.entries(filters)
        return tempFilters.every(f => {
          return f[1][1] <= d[f[0]] && d[f[0]] <= f[1][0]
        })
        
      }

      const yBrushes = {};
      var brush = Object.entries(yScales).map(x =>{
        let extent = [[-(brush_width/2), padding-1],
        [brush_width/2, height-padding]]
        yBrushes[x[0]] = d3.brushY()
          .extent(extent)
          .on('brush', () => brusheventHandler(x[0]))
          .on('end', () => brusheventHandler(x[0]))
      })
      var lineGenerator = d3.line()
    
       function linePath(d) {
        const tempdata = Object.entries(d).filter(x => x[0])
        let points = []
        newfeatures.map(function(newfeature) {
          tempdata.map(function(x){
            if(newfeature === x[0]){
              points.push([xScales(newfeature),yScales[newfeature](x[1])])
            }
          })
        })
        return(lineGenerator(points))
      }

      var highlight = function(d){
        selected_student = d.Name
        selectedstudent.innerHTML = selected_student;

        // Second the hovered specie takes its color
        d3.selectAll("." + selected_student)
          .transition().duration(5)
          .style("stroke", selected_student)
          .style("opacity", "5")
          .style('stroke', 'red')
          //.style({'stroke': 'red', 'fill': 'none', 'stroke-width': '1px'}) 
      }
    
      // Unhighlight
      var doNotHighlight = function(){
        d3.selectAll("." + selected_student)
        .transition().duration(5)
        .style("stroke", selected_student)
        .style("opacity", ".4")
        .style('stroke', '#0081af')
      }

      var dragging = {},
      active,
      inactive;

      function position(d) {
        var v = dragging[d];
        return v == null ? xScales(d) : v;
      }
      
      function transition(g) {
        return g.transition().duration(50);
      }

      const svg = d3.select("#parallelcoords")
        .append('svg')
        .attr("viewBox", "0 0 1200 400")
    
      inactive = svg.append('g')
          .attr('class','inactive')
          .selectAll('path')
          .data(data)
          .enter()
            .append('path')
            .attr('d', linePath)
    
      active = svg.append('g')
          .attr('class','active')
          .selectAll('path')
          .data(data)
          .enter()
            .append('path')
            .attr("class", function (d) { return "line " + d.Name } )
            .attr('d', linePath)
            .style("opacity", 0.5)
            .on("mouseover", highlight)
            .on("mouseleave", doNotHighlight)
    
      const featureAxisG = svg.selectAll('g.feature')
        .data(features)
        .enter()
          .append('g')
            .attr('class','feature')
            .attr('transform', d =>('translate('+ xScales(d.name) +')'))
            .call(d3.drag()
              .on("start", function(d){
                dragging[(d.subject).name] = this.__origin__ = xScales((d.subject).name)
               inactive.attr("visibility", "hidden")
              })        
              .on("drag",function(d) {
                dragging[(d.subject).name] = Math.min(width, Math.max(0, this.__origin__ += d.dx));
                active.attr('d',linePath);
                newfeatures.sort(function(a, b) { return position(b) - position(a); });
                xScales.domain(newfeatures);
                featureAxisG.attr("transform", function(d) { return "translate(" + position(d.name) + ")"; })
              })
              .on("end",  function(d) {
                delete this.__origin__;
                delete dragging[(d.subject).name];
                transition(d3.select(this)).attr('transform',d=>('translate('+ xScales(d.name)+')'));
                transition(active).attr('d', linePath)
                inactive.attr('d', linePath)
                  .transition()
                  .delay(20)
                  .duration(0)
                  .attr("visibility", null)
              }));
    
        featureAxisG
              .append('g')
              .each(function(d){
                d3.select(this)
                .call(yAxis[d.name]);
              });

        featureAxisG
          .each(function(d){
            d3.select(this)
              .append('g')
              .attr('class','brush')
              .call(yBrushes[d.name]);
          });
    
        featureAxisG
          .append("text")
          .attr("text-anchor", "middle")
          .attr('y', padding/2)
          .text(d=>d.name);

}

