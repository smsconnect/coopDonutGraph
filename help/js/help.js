//Main object that holds functions that deal with positioning sizing of inititial
//help and title of a visualizations. Default state is visibile when the user
//first views the visualization.
var help = {


  //object to hold elements of the help.
  elem: {},


  //object to hold meaurements
  meas: {},


  //property to keep track of if the help is hidden or not
  hidden: true,


  //property that records if user has interacted yet (help is hidden after 5 sec if user does not interact)
  //interaction: false,



  /**
   * setUp
   *   Initial function that uses jquery to wait until the page is ready before
   *   defining element properties as well as establishing a timeout function to
   *   draw attention to the button after a certain amount of time, and attach
   *   other event listeners to the elements
   *
   * @param {object} vis - The object that the help description is being applied to
   */
  setUp: function(vis){

      console.log(vis);

      help.vis = vis;

      help.meas.width = document.documentElement.clientWidth; //stores document width
      help.meas.height = document.documentElement.clientHeight;  //stores document height

      help.addElements();

      //help.elem.helpDiv = document.getElementsByClassName("help-text")[0];  //store help ('help') div reference
      //help.elem.helpDiv = "red";
      help.elem.button = document.getElementsByClassName("button help")[0];  //store hide/show button reference

      help.styleWidth();
      help.fillText();



      //Touch ANYWHERE within help will close it
      d3.select(help.elem.helpDiv)  //D3, select help ('top') div
        .on("touchstart", function(){  //bind touch event
          d3.event.stopPropagation();
          //if( !help.hidden ){  //if help is showing
          //  help.hide();  //hide the help
          //}
        });

      //Touch ANYWHERE within help will close it
      d3.select(help.elem.closeHolder)  //D3, select help ('top') div
        .on("touchstart", function(){  //bind touch event
          //d3.event.stopPropagation();
          if( !help.hidden ){  //if help is showing
            help.hide();  //hide the help
          }
        });


      d3.select(help.elem.button)  //D3, select hide/show button
        .on("touchstart", function(){  //bind touch event
          console.log("touched");
          if(help.hidden){  //if help is currently hidden
            help.show();  //show the help
          }else{  //if the help is currently showing
            help.hide();  //hide the help
          }

          d3.select(this).attr("id", "active");
        })
        .on("touchstart.cancel", function() { d3.event.stopPropagation(); })
        .on("touchend",   function(){d3.select(this).attr("id", null);});
  },


  /**
   * Creates div to hold all help explanations ('help-text') and a close button.
   * Creating here and adding to the DOM allows 'help.js' to be properly applied
   * to many different visualization without editing the 'index.html' of each vis.
   */
  addElements: function(){
    var helpText = document.createElement("div");
    var closeHolder = document.createElement("div");
    var close = document.createElement("p");

    help.elem.helpDiv = helpText; //save reference to main div to be used later
    help.elem.closeHolder = closeHolder; //save reference to close holder div that will listen for touch
    help.elem.close = close; //save reference to 'help-close' <p> element to be used later

    helpText.className = "help-text";
    closeHolder.className = "help-close-holder";
    close.className = "help-close";

    close.innerHTML = "&#215;";
    closeHolder.appendChild(close);
    helpText.appendChild(closeHolder);
    document.body.appendChild(helpText);
  },



  /**
   * styleWidth
   *
   */



  styleWidth: function() {
    var button = help.elem.button;
    var width = help.meas.width;

    //addresses minor sizing issues...easier than doing in css and worrying about pixel ratios
    if (width < 330) {
      return;
    }else if (width < 370) {
      button.style.fontSize = "2.65em";
      button.style.lineHeight = 1.1;
    } else if (width < 400) {
      button.style.lineHeight = 1.2;
    } else if (width < 450) {
      button.style.fontSize = "2.85em";
      button.style.lineHeight = 1.1;
    }
  },




  /**
   * fillText
   *   Function to get information from the main visualization object that was passed
   *   in and saved as help.vis
   */
  fillText: function() {
    var vis = help.vis;
    var title = document.createElement("h2");
    var description = document.createElement("p")
    var list = document.createElement("ol");
    var navMessage = document.createElement("p");
    var navArrow = document.createElement("p");

    title.className = "help-title";
    title.innerHTML = "Help";
    description.className = "help-description";
    navMessage.className = "help-nav-message";
    navArrow.className = "help-nav-arrow";

    for (var i in vis.helpDescription) {
      var text = document.createElement("li");
      var image = document.createElement("img");

      text.innerHTML = vis.helpDescription[i].text;
      image.setAttribute("src",vis.helpDescription[i].image);

      list.appendChild(text);
      list.appendChild(image);
    }

    navMessage.innerHTML = "Click here to display app nav bar";
    navArrow.innerHTML = "&#8681;";


    help.elem.helpDiv.appendChild(title);
    description.appendChild(list);
    description.appendChild(navMessage);
    description.appendChild(navArrow);
    help.elem.helpDiv.appendChild(description);
  },



  /**
   * hide
   *   Function to hide the help after the user interacts with the div or
   *   the button. Shrinks the div, changes the opacity of the directions so they
   *   are no longer visible, and moves the button to the top right area of the screen
   */
  hide: function() {
    help.elem.helpDiv.style.height = "0%";

    if (typeof jQuery == 'undefined') {
      help.elem.helpDiv.scrollTop = 0;
    } else {
      $( ".help-text" ).animate({scrollTop: 0}, 500);
    }

    help.hidden = true;
    //d3.selectAll(".button").style("border","none");

    help.elem.button.style.background = "#000";
    help.elem.button.style.color = "#fff";

    $( ".button.nav" ).find("rect, polygon").attr("fill", "#fff")
    $( ".button.nav" ).find("line").attr("stroke", "#fff");
    $( ".button.nav" ).css("background","#000");

    $( ".help-close" ).stop(true).fadeOut();
  },



  /**
   * show
   *   Function to show the descriptions after the user hits the button when the
   *   help is hidden. Expands the div, changes the opacity of the directions
   *   so they are visible, and moves the button to the lower middle area of the div
   */
  show: function() {
    //help.fillText();

    if (help.vis.current.active) {
      help.vis.leavePath(help.vis.current.d, help.vis.current.touched);
    }

    if (!description.hidden) {
      description.hide();
    }

    //d3.selectAll(".button").style("border","2px solid white");

    help.elem.button.style.background = "#fff";
    help.elem.button.style.color = "#000";

    $( ".button.nav" ).find("rect, polygon").attr("fill", "#000")
    $( ".button.nav" ).find("line").attr("stroke", "#000");
    $( ".button.nav" ).css("background","#fff");

    $( ".help-close" ).stop(true).fadeIn();

    help.elem.helpDiv.style.height = "75%";

    help.hidden = false;
  }
}
