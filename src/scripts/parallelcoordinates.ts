declare const d3: any;

class SteerableParacoords {
  private data: any;
  private newfeatures: any;
  width: number;
  private height: number;
  private padding: number;
  private brush_width: number;
  private filters: {};
  features: any[];
  xScales: any;
  dragging: any;
  private featureAxisG: any;
  yScales: {};
  private active: any;
  private inactive: any;



  constructor(data, newfeatures) {
    this.data = data;
    this.newfeatures = newfeatures;
    this.width = 1200;
    this.height = 400;
    this.padding = 50;
    this.brush_width = 20;
    this.filters = {};
    this.features = [];
    this.xScales = null;
    this.dragging = {};
    this.featureAxisG = null;
    this.yScales = {};
    this.active = null;
    this.inactive = null;
  }

  setupAxis()
  {

  }

  // TODO implement
  loadCSV(csv)
  {

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
        paracoords.newfeatures.sort((a, b) => { return paracoords.position(b, paracoords) - paracoords.position(a, paracoords); });
        paracoords.xScales.domain(paracoords.newfeatures);
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


  // TODO refactor
  GenerateSVG() {
    // var features = [];
    var newdataset = [];

    this.data.forEach(obj => {
      var newdata = {};
      this.newfeatures.forEach(feature => {
        newdata[feature] = obj[feature]
      })
      newdataset.push(newdata)
    })

    var temp = Object.keys(newdataset[0])
    temp.forEach(element => this.features.push({ 'name': element }))

    this.xScales = d3.scalePoint()
      .range([this.width - this.padding, this.padding])
      .domain(this.features.map(x => x.name))

    this.features.map(x => {

      if (x.name === "Name") {
        this.yScales[x.name] = d3.scalePoint()
          .domain(newdataset.map(function (d) { return d.Name; }))
          .range([this.padding, this.height - this.padding])
      }
      else {
        this.yScales[x.name] = d3.scaleLinear()
          .domain([0, 100])
          .range([this.height - this.padding, this.padding])
      }
    })

    var yAxis = {};
    Object.entries(this.yScales).map(x => {
      yAxis[x[0]] = d3.axisLeft(x[1])
    })


    /*const brusheventHandler = function (event, features) {
      if (event.sourceEvent && event.sourceEvent.type === 'zoom')
        return;
      if (features === 'Name') {
        return;
      }
      if (event.selection != null) {
        this.filters[features] = event.selection.map(() => yScales[features])
      } else {
        if (features in this.filters)
          delete (this.filters[features])
      }
      applyFilters()
    }

    const applyFilters = function () {
      d3.select('g.active').selectAll('path')
        .style('display', d => (selected(d) ? null : 'none'))
    }

    const selected = function (d) {
      const tempFilters = Object.entries(this.filters)
      return tempFilters.every(f => {
        return f[1][1] <= d[f[0]] && d[f[0]] <= f[1][0]
      })

    }

    const yBrushes = {};
    Object.entries(yScales).map(x => {
      let extent = [[-(this.brush_width / 2), this.padding - 1],
      [this.brush_width / 2, this.height - this.padding]]
      yBrushes[x[0]] = d3.brushY()
        .extent(extent)
        .on('brush', (event) => brusheventHandler(event, x[0]))
        .on('end', (event) => brusheventHandler(event, x[0]))
    })*/

    var highlight = function (d) {
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

    // Unhighlight
    var doNotHighlight = function (d) {
      var selected_student = d.target.__data__.Name
      d3.selectAll("." + selected_student)
        .transition().duration(5)
        .style("stroke", selected_student)
        .style("opacity", ".4")
        .style('stroke', '#0081af')
    }

    function transition(g) {
      return g.transition().duration(50);
    }


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
      .on("mouseover", highlight)
      .on("mouseleave", doNotHighlight)



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
          .call(yAxis[d.name]);
      });

    this.featureAxisG
      .each(function (d) {
        d3.select(this)
          .append('g')
          .attr('class', 'brush')
          //.call(yBrushes[d.name]);
      });

    this.featureAxisG
      .append("text")
      .attr("text-anchor", "middle")
      .attr('y', this.padding / 2)
      .text(d => d.name)
      .on("click", invert);

    function invert(event, d) {
      this.yScales[d.name] = d3.scaleLinear()
        .domain(this.yScales[d.name].domain().reverse())
        .range([this.padding, this.height - this.padding]);
    }
  }

  linePath(d) {
    var lineGenerator = d3.line()
    const tempdata = Object.entries(d).filter(x => x[0])
    let points = []
    this.newfeatures.map(newfeature => {
      tempdata.map(x => {
        if (newfeature === x[0]) {
          points.push([this.xScales(newfeature), this.yScales[newfeature](x[1])])
        }
      })
    })
    return (lineGenerator(points))
  }
  
}



