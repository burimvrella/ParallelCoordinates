declare const d3: any;

class SteerableParacoords {
  private data: any;
  private newFeatures: any;
  private width: number;
  private height: number;
  private padding: number;
  private brushWidth: number;
  private filters: {};
  features: any[];
  xScales: any;
  dragging: any;
  private featureAxisG: any;
  yScales: {};
  private active: any;
  private inactive: any;
  private newDataset: any;
  yBrushes: {};
  yAxis: {};

  constructor(data?, newFeatures?) {
    if(data) {
      this.data = data;
    }
    if(newFeatures) {
      this.newFeatures = newFeatures;
    }
    this.width = 1200;
    this.height = 400;
    this.padding = 50;
    this.brushWidth = 20;
    this.filters = {};
    this.features = [];
    this.xScales = null;
    this.dragging = {};
    this.featureAxisG = null;
    this.yScales = {};
    this.active = null;
    this.inactive = null;
    this.newDataset = [];
    this.yBrushes = {};
    this.yAxis = {};
  }

  // TODO implement
  loadCSV(csv)
  {
    var tmp_data = d3.csvParse(csv);
    this.data = tmp_data.sort((a,b) => a.Name.toLowerCase() > b.Name.toLowerCase() ? 1 : -1);
  }

  //not happy with this, but at the moment we need it
  getData(): any
  {
    return this.data;
  }

  setFeatures(newFeatures): void
  {
    this.newFeatures = newFeatures;
  }

  invert(dimension)
  {

  }

  getInversionStatus(dimension)
  {

  }

  move(dimension, toRightOf, A)
  {

  }

  getDimensionPositions()
  {

  }

  getFilter(dimension)
  {

  }

  setFilter(dimension)
  {

  }

  getSelected()
  {

  }

  select(records)
  {

  }

  saveAsSCG()
  {

  }

  position(this: any, d: any, paracoords: any) {
    var v = paracoords.dragging[d];
    return v == null ? paracoords.xScales(d) : v;
  }

  onDragStartEventHandler(paracoords)
  {
    {
      return function onDragStart (d)
      {
        this.__origin__ = paracoords.xScales((d.subject).name);
        paracoords.dragging[(d.subject).name] = this.__origin__;
        paracoords.inactive.attr("visibility", "hidden");
      }
    }
  }

  onDragEventHandler(paracoords) {
    {
      return function onDrag(d) {
        paracoords.dragging[(d.subject).name] = Math.min(paracoords.width, Math.max(0, this.__origin__ += d.dx));
        paracoords.active.attr('d', paracoords.linePath.bind(paracoords));
        paracoords.newFeatures.sort((a, b) => { return paracoords.position(b, paracoords) - paracoords.position(a, paracoords); });
        paracoords.xScales.domain(paracoords.newFeatures);
        paracoords.featureAxisG.attr("transform", (d) => { return "translate(" + paracoords.position(d.name, paracoords) + ")"; });
      };
    }
  }

  transition(g) {
    return g.transition().duration(50);
  }


  onDragEndEventHandler(paracoords) {
    {
      return function onDragEnd(d) {
        delete this.__origin__;
        delete paracoords.dragging[(d.subject).name];
        paracoords.transition(d3.select(this)).attr('transform', d => ('translate(' + paracoords.xScales(d.name) + ')'));
        paracoords.transition(paracoords.active).attr('d', paracoords.linePath.bind(paracoords));
        paracoords.inactive.attr('d', paracoords.linePath.bind(paracoords))
            .transition()
            .delay(5)
            .duration(0)
            .attr("visibility", null);
      };
    }
  }

  onInvert(paracoords){
    {
      return function invert(event,d){
        console.log(this.parentElement.childNodes[0])
        d3.select(this.parentElement.childNodes[0])
            .call(paracoords.yAxis[d.name].scale(paracoords.yScales[d.name].domain(paracoords.yScales[d.name].domain().reverse())))
          .transition()

      }
    }
  }

  prepareData()
  {
    this.data.forEach(obj => {
      var newdata = {};
      this.newFeatures.forEach(feature => {
        newdata[feature] = obj[feature]
      })
      this.newDataset.push(newdata)
    })

    Object.keys(this.newDataset[0]).forEach(element => this.features.push({ 'name': element }))
  }

  setupScales()
{
    //TODO check if intager and if then get all values for max and min 
    this.features.map(x => {

      if (x.name === "Name") {
        this.yScales[x.name] = d3.scalePoint()
            .domain(this.newDataset.map(function (d) { return d.Name; }))
            .range([this.padding, this.height - this.padding])
      }
      else {
        var max = Math.max(...this.newDataset.map(o => o[x.name]))
        var min = Math.min(...this.newDataset.map(o => o[x.name]))
        this.yScales[x.name] = d3.scaleLinear()
            .domain([min, max]).nice()
            .range([this.height - this.padding, this.padding])
      }
    })

    this.xScales = d3.scalePoint()
        .range([this.width - this.padding, this.padding])
        .domain(this.features.map(x => x.name))
  }

  setupYAxis() 
  {
    Object.entries(this.yScales).map(x => {
        this.yAxis[x[0]] = d3.axisLeft(x[1]);
    });
    return this.yAxis;
  }

  setupBrush()
  {
    Object.entries(this.yScales).map(x => {

      let extent = [[-(this.brushWidth / 2), this.padding - 1],
                    [this.brushWidth / 2, this.height - this.padding]]

      this.yBrushes[x[0]] = d3.brushY()
        .extent(extent)
        .on('brush',this.onBrushEventHandler(this))
        .on('end', this.onBrushEventHandler(this))
    });
    return this.yBrushes
  }

  onBrushEventHandler(paracoords) {
    {
      return function brushEventHandler(event,features) {
        if (event.sourceEvent && event.sourceEvent.type === 'zoom')
        return;
        if (paracoords.features === 'Name') {
          return;
        }
        if (event.selection != null) {
            const remappedSelection = event.selection.map((x) => {
                const scale = paracoords.yScales[features.name];// Get the appropriate scale based on features
                return scale.invert(x); // Remap the selection value
            });
            paracoords.filters[features.name] = remappedSelection;
        } else {
          if (features.name in paracoords.filters)
            delete (paracoords.filters[features.name])
        }
        paracoords.applyFilters();
      };
    }
  }

  applyFilters() {
    d3.select('g.active').selectAll('path')
    .style('display', d => (this.selected(d) ? null : 'none'))
  }

  selected(d) {
    const tempFilters = Object.entries(this.filters)
    return tempFilters.every(f => {
      return f[1][1] <= d[f[0]] && d[f[0]] <= f[1][0];
    });
  }
  
  // TODO refactor
  generateSVG() {
    this.prepareData();
    this.setupScales();
    var yaxis = this.setupYAxis();
    var brushes = this.setupBrush();

    const svg = d3.select("#parallelcoords")
        .append('svg')
        .attr("viewBox", "0 0 1200 400")

    this.inactive = svg.append('g')
        .attr('class', 'inactive')
        .selectAll('path')
        .data(this.data)
        .enter()
        .append('path')
        .attr('d', this.linePath.bind(this))

    this.active = svg.append('g')
        .attr('class', 'active')
        .selectAll('path')
        .data(this.data)
        .enter()
        .append('path')
        .attr("class", function (d) { return "line " + d.Name })
        .attr('d', this.linePath.bind(this))
        .style("opacity", 0.5)
        .on("mouseover", this.highlight)
        .on("mouseleave", this.doNotHighlight)

    this.featureAxisG = svg.selectAll('g.feature')
        .data(this.features)
        .enter()
        .append('g')
        .attr('class', 'feature')
        .attr('transform', d => ('translate(' + this.xScales(d.name) + ')'))
        .call(d3.drag()
            .on("start", this.onDragStartEventHandler(this))
            .on("drag", this.onDragEventHandler(this))
            .on("end", this.onDragEndEventHandler(this))
        );

    this.featureAxisG
        .append('g')
        .each(function (d) {
          d3.select(this)
              .call(yaxis[d.name]);
        });

    this.featureAxisG
        .each(function (d) {
          d3.select(this)
              .append('g')
              .attr('class', 'brush')
              .call(brushes[d.name]);
        });

    this.featureAxisG
        .append("text")
        .attr("text-anchor", "middle")
        .attr('y', this.padding / 2)
        .text(d => d.name);
        //.on("click", this.onInvert(this));

    this.featureAxisG
            .append("rect")
            .attr('y', this.padding / 2 - 20)
            .attr('width', 10)
            .attr('height', 5)
            .attr('stroke', 'black')
            .attr('fill', '#69a3b2')
            .on("click", this.onInvert(this)); 
  }

  linePath(d) {
    var lineGenerator = d3.line()
    const tempdata = Object.entries(d).filter(x => x[0])
    let points = []
    this.newFeatures.map(newfeature => {
      tempdata.map(x => {
        if (newfeature === x[0]) {
          points.push([this.xScales(newfeature), this.yScales[newfeature](x[1])])
        }
      })
    })
    return (lineGenerator(points))
  }


  highlight(d) {
    var selected_student = d.target.__data__.Name
    const selectedStudentElement = document.getElementById("selectedstudent");
    if (selectedStudentElement) {
      selectedStudentElement.innerHTML = selected_student;
    }
    // Second the hovered specie takes its color
    d3.selectAll("." + selected_student)
        .transition().duration(5)
        .style("stroke", selected_student)
        .style("opacity", "5")
        .style('stroke', 'red')
  }

  doNotHighlight(d) {
    var selected_student = d.target.__data__.Name
    d3.selectAll("." + selected_student)
        .transition().duration(5)
        .style("stroke", selected_student)
        .style("opacity", ".4")
        .style('stroke', '#0081af')
  }



}



