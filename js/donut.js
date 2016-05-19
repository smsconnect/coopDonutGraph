var donut = {

  d3tools: {},
  elem: {},
  meas: {},

  current: {
    active: false
  },

  //data object for the top description
  description: {
    "title": "Co-op Industry Visualization",
    "text": "Touch a section of the donut graph to view the industries where our students have had a co-op, as well as the percentage of student who get a co-op in that industry."
  },

  //property to distinguish whether to users to phone or tablet articles if cross linking to another article within the app [defaults to phone]
  articles: "phone",



  /**
   * Starts the creation of the donut object and animation and calls other contructing functions
   */
  setUp: function(){
    $( document ).ready(function(){
      var dM = donut.meas;

      //get width and height of screen
      dM.width = document.documentElement.clientWidth,
      dM.height = document.documentElement.clientHeight,

      //calculations to base the size of the graph and placement of animations on the screen size
      dM.circleCY = dM.height / 2.6;
      dM.circleCX = dM.width / 2;
      dM.outerRadius = donut.calculateRadii("outerRadius");
      dM.innerRadius = donut.calculateRadii("innerRadius");
      dM.circleOutsideEdge = dM.circleCY + dM.outerRadius;
      dM.industryEndLocation = dM.height < 500 ? Math.round(dM.circleOutsideEdge + dM.height * (2 / 29)) : Math.round(dM.circleOutsideEdge + dM.height * (1 / 11));

      //sets up the description at the top of the article
      description.setUp();

      //several functions to construct
      donut.positionElements();
      donut.makeTools();
      donut.makeVis();
      donut.addListeners();
      donut.phoneOrTabletArticles();

      //call API function to disable nav dropdown
      goAPI();
    });
  },


  /**
   * Calculates inner and outer radius for donut graph -- different measurements above
   * and below 600 pixels
   */
  calculateRadii: function(radius){
    if(donut.meas.width < 600){
      if(radius == "outerRadius"){
        return donut.meas.width / 2 - (donut.meas.width / 25);
      }
      else{
        return (donut.meas.width/2 - (donut.meas.width / 25)) - (donut.meas.width * .2);
      }
    }
    else{
      if(radius == "outerRadius"){
        return 280;
      }
      else{
        return 160;
      }
    }
  },



  /**
   * Calculations to properly position the text elements and article link that
   * animate when a user interacts with the donut graph.
   */
  positionElements: function(){
    var dE = donut.elem;
    var dM = donut.meas;

    dE.divMiddle = document.getElementsByClassName("text-middle")[0]; //document.createElement("div");
    dE.hiddenLink = document.getElementById("hidden-link");
    dE.industry = document.getElementsByClassName("industry-text")[0];//document.createElement("p");
    dE.industryLabelBack = document.getElementById("label-back");
    dE.industryLabelDown = document.getElementsByClassName("label down")[0];//document.createElement("p");
    dE.industryLabelUp = document.getElementsByClassName("label up")[0];//document.createElement("p");
    dE.percentNumber = document.getElementsByClassName("percent-number")[0];//document.createElement("p");
    dE.percentText = document.getElementsByClassName("percent-text")[0];//document.createElement("p");


    dM.industryHeight = dE.industry.clientHeight;
    dM.industryLabelUpHeight = dE.industryLabelUp.clientHeight;
    dM.industryLabelDownHeight = dE.industryLabelDown.clientHeight;

    document.body.appendChild(dE.industry);
    dE.divMiddle.appendChild(dE.percentNumber);
    dE.divMiddle.appendChild(dE.percentText);

    dE.industryLabelBack.style.height = dM.industryHeight + "px";
    dE.industryLabelBack.style.top = dM.industryEndLocation + "px";

    if (dM.width > 600) {
      dE.percentNumber.style.fontSize = "10vw";
      dE.percentText.style.fontSize = "3.5vw";
    }

    dM.divMiddleHeight = dE.divMiddle.clientHeight; //*****
    dM.divMiddleWidth = dE.divMiddle.clientWidth;  //******
    dE.divMiddle.style.top = dM.circleCY - dM.divMiddleHeight/2 + "px"; //****
    dE.divMiddle.style.left = dM.circleCX - dM.divMiddleWidth/2 + "px"; //****

    dM.industryStartLocation = dM.circleCY - (dM.divMiddleHeight/2) - dM.industryHeight;  //define industry start location after finding industryHeight and divMiddleHeight

    dM.industryLabelUpStartLocation = dM.industryEndLocation;
    dM.industryLabelDownStartLocation = dM.industryEndLocation + dM.industryHeight - dM.industryLabelDownHeight;

    dE.industryLabelUp.style.top = dM.industryLabelUpStartLocation + "px";
    dE.industryLabelDown.style.top = dM.industryLabelDownStartLocation + "px";

    dM.industryLabelUpEndLocation = dM.industryEndLocation - dM.industryLabelUpHeight + 1;  //plus 1 for weird pixel problem...fix later?
    dM.industryLabelDownEndLocation = donut.meas.industryEndLocation + donut.meas.industryHeight;
  },


  /**
   * Make the d3 arc 'tools', set the color bands, assign their inner and outer
   * radii, sort the sections by percentage size
   */
  makeTools: function(){
    //use built in d3 color scale to color donut
    donut.d3tools.color = d3.scale.ordinal()
      .range(["#002e6c", "#00adee", "#ff661b", "#025594", "#9fc600", "#333333", "#be1e2d"]);

    //make the first d3 arc
    donut.d3tools.arc = d3.svg.arc()
      .outerRadius(donut.meas.outerRadius)
      .innerRadius(donut.meas.innerRadius);

    //make a second d3 arc
    donut.d3tools.secondaryArc = d3.svg.arc()
      .outerRadius(donut.meas.outerRadius + (donut.meas.width / 35))
      .innerRadius(donut.meas.innerRadius);

    //make pie function that will sort the sections and arrange by size
    donut.d3tools.pie = d3.layout.pie()
      .sort(null)
      .value(function(d) {
        return d.percent;
      });
  },


  /**
   * Use the d3 arcs that we just created and actually construct the donut width
   * and height and the different sections of the donut using the percentage in the
   * data object.
   *
   * @return {[type]} [description]
   */
  makeVis: function(){
    //'svg' element that is the same size as the screen - holds all vis elements
    donut.elem.svg = d3.select("body")
      .append("svg")
        .attr("width", donut.meas.width)
        .attr("height", donut.meas.height);

    //'g' element to group all donut vis elements and center circle
    donut.elem.gVis = donut.elem.svg.append("g")
        .attr("transform", "translate(" + donut.meas.width / 2 + "," + donut.meas.circleCY + ")");

    //center circle that appears in the middle of the donut vis
    donut.elem.centerCircle = donut.elem.svg.append("circle")
      .attr("cx", donut.meas.circleCX)
      .attr("cy", donut.meas.circleCY)
      .attr("r", donut.meas.innerRadius)
      .attr("fill","rgba(255,255,255,0)");

    //makes pie sections
    var g = donut.elem.gVis.selectAll(".arc")
      .data(donut.d3tools.pie(donut.data))
      .enter()
      .append("g")
        .attr("class", "arc");

    g.append("path")
      .attr("d", donut.d3tools.arc)
      .style("fill", function(d,i) {
        return donut.d3tools.color(i);
      })
      .on("touchstart", function(d) {
        if (donut.current.active && donut.current.touched === this) {
          donut.leavePath(d, this);
        } else {
          d3.select(this)
            .transition("linear")
              .attr("d", donut.d3tools.secondaryArc)

          donut.touchPath(d, this);
        }
      })
      .on("touchstart.cancel", function() {
        d3.event.stopPropagation();
      });

    g.append("text")
      .attr("transform", function(d) {
        return "translate(" + donut.d3tools.arc.centroid(d) + ")";
      })
      .attr("dy", ".35em")
      .attr("class","donut-text")
      .style("font-size", function(d) {
        if (d.data.industry === "Software" || d.data.industry === "Consumer Products") {
          if (donut.meas.width < 600) {
            return "2.5vw";
          } else {
            return  ".95em"; //static, because the inner and outer donut radii measurements are now static (see [calculateRadii])
          }
        } else if (donut.meas.width > 600) {
          return "2.5vw";
        }
      })
      .attr("fill", "white")
      .text(function(d) { return d.data.industry; });
  },



  /**
   * Adds a listener to the body of the page which will close the description if it is open
   * and it will deselect a portion of the donut if it was selected
   */
  addListeners: function() {
    d3.select("body")
      .on ("touchstart", function(d) {
        if (donut.current.active) {
          donut.leavePath(donut.current.d, donut.current.touched);
        }

        if (!description.hidden) {
          description.hide();
        }
      });
  },



  /**
   * Adobe problem...determines whether the screen is smaller or larger than 600 pixels;
   * this effects the link that we use for the outside articles.
   */
  phoneOrTabletArticles: function() {
    var width = donut.meas.width;

    if (width >= 600) {
      donut.articles = "tablet";
    }
  },



  /**
   * Handles the behavior when a user touches a section of the donut graph

   * @param  {object} d       data object for d3 elements
   * @param  {[type]} touched which path was touched by the user
   */
  touchPath: function(d, touched) {

    if (donut.current.active) {
      donut.leavePath(donut.current.d,donut.current.touched);
    }

    if (d.data.industry === "Other") {
      donut.elem.industryLabelUp.innerHTML = "...find a co-op in an";
      donut.elem.industryLabelBack.style.background = "#000";
    }else {
      donut.elem.industryLabelUp.innerHTML = "...find a co-op in the";
      donut.elem.industryLabelBack.style.background = "rgba(0, 0, 0, 0.75)";
    }

    donut.elem.centerCircle
        .attr("fill","rgba(255,255,255,0)");

    if(!description.hidden){
      description.hide();
    }

    if(d.data.image){
      d3.select('#background')
        .attr("src", d.data.image)
        .style("display", "block");
    }else{
      d3.select('#background').style("display", "none");
    }

    d3.select(touched.parentNode.childNodes[1])
      .transition()
        .text(function(d) {
          return "";
        });

    d3.select(donut.elem.industry)
      .text(d.data.industry);

    d3.select(donut.elem.percentNumber)
      .text(d.data.percent + "%");

    d3.select(donut.elem.divMiddle)
      .style("opacity", 0)
      .transition().duration(500)
        .style("opacity", 1);

    donut.elem.centerCircle
      .transition().duration(1500)
        .attr("fill","rgba(255,255,255,.80)");

    d3.select(donut.elem.industry)
      //.style("background", "#e5e5e5")
      .style("opacity", 0)
      .style("text-shadow", "0px 2px 2px rgba(0, 0, 0, 0.5)")
      .style("top", donut.meas.industryStartLocation + "px")
      .transition().duration(750)
        .style("opacity", 1)
        .style("background", touched.style.fill)
        .style("top", donut.meas.industryEndLocation + "px")

    d3.select(donut.elem.industryLabelBack)
      .style("top", donut.meas.industryEndLocation + "px")
      .style("height", donut.meas.industryHeight + "px")
      .style("opacity", 0)
      .transition().duration(750)
        .style("top", donut.meas.industryLabelUpEndLocation + "px")
        .style("height", donut.meas.industryHeight + donut.meas.industryLabelUpHeight + donut.meas.industryLabelDownHeight + "px")
        .style("opacity", 1);

    d3.select(donut.elem.industryLabelUp)
      .style("top", donut.meas.industryLabelUpStartLocation + "px")
      .style("opacity", 0)
      .transition().duration(750)
        .style("top", donut.meas.industryLabelUpEndLocation + "px")
        .style("opacity", 1);

    d3.select(donut.elem.industryLabelDown)
      .style("top", donut.meas.industryLabelDownStartLocation + "px")
      .style("opacity", 0)
      .transition().duration(750)
        .style("top", donut.meas.industryLabelDownEndLocation + "px")
        .style("opacity", 1);

    donut.current.active = true;
    donut.current.d = d;
    donut.current.touched = touched;

    if(d.data.article){
      var dehL = donut.elem.hiddenLink;  //holder var to make repeated element reference more readable

      //sets the href of link to tablet or phone article depending on device determined in [phoneOrTabletArticles()]
      dehL.setAttribute("href", d.data.article[donut.articles]);

      dehL.style.opacity = 1;
      dehL.style.background = touched.style.fill;
      dehL.removeEventListener("click", donut.stopDefAction);
    }
    else{
      donut.elem.hiddenLink.addEventListener("click", donut.stopDefAction, false);
    }
  },



  /**
   * Handles the behavior when a user touches something after touching a donut graph path

   * @param  {object} d       data object for d3 elements
   * @param  {[type]} touched which path was touched by the user
   */
  leavePath: function(d, touched){
    d3.select(touched.parentNode.childNodes[1])
      .transition()
        .text(function(d) {
          return d.data.industry;
        });

    d3.select(touched)
      .transition("linear")
        .attr("d", donut.d3tools.arc);

    donut.current.active = false;

    donut.elem.centerCircle
      .transition().duration(700)
        .attr("fill","rgba(255,255,255,0)");

    d3.select(donut.elem.divMiddle)
      .transition().duration(700)
        .style("opacity", 0);

    d3.select(".industry-text")
      .transition().duration(750)
        .style("top", donut.meas.industryStartLocation + "px")
        .style("opacity", 0)

    d3.select(donut.elem.industryLabelBack)
      .transition()
        .style("top", donut.meas.industryEndLocation + "px")
        .style("height", donut.meas.industryHeight + "px")
        .style("opacity", 0);

    d3.select(donut.elem.industryLabelUp)
      .transition()
        .style("top", donut.meas.industryLabelUpStartLocation + "px")
        .style("opacity", 0);

    d3.select(donut.elem.industryLabelDown)
      .transition()
        .style("top", donut.meas.industryLabelDownStartLocation + "px")
        .style("opacity", 0);

    donut.elem.hiddenLink.style.opacity = 0;
    donut.elem.hiddenLink.style.background = "#666";
  },



  /**
   * Stops default action of an event...not sure why I made a function for this
   * @param  {object} evt Event object that is having its default action suppressed
   */
  stopDefAction: function(evt){
    evt.preventDefault();
  },



  //main data object that holds industry names, percentage, and if we have article of not (also unused count property as of right now)
  data: [
    {
      "industry":"Print",
      "count":53,
      "percent":37,
      "image": "images/print.jpg",
      article: {
        "phone": "navto://coopreport_darwin",
        "tablet": "navto://darwilltablet"
      }
    },

    {
      "industry":"Advertising",
      "count":21,
      "percent":15,
      "article": false,
      "image": "images/advertising.jpg"
    },

    {
      "industry":"Consumer Products",
      "count":22,
      "percent":15,
      "article": false,
      "image": "images/consumer.jpg"
    },

    {
      "industry":"Publishing",
      "count":13,
      "percent":9,
      "article": false,
      "image": "images/publishing.jpg"
    },

    {
      "industry":"Vendor",
      "count":13,
      "percent":9,
      "article": false,
      "image": "images/vendor.jpg"
    },

    {
      "industry":"Other",
      "count":11,
      "percent":7,
      "article": false,
      "image": "images/other.jpg"
    },

    {
      "industry":"Software",
      "count":8,
      "percent":6,
      "article": false,
      "image": "images/software.jpg"
    }
  ]
}
