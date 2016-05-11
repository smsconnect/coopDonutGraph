/**
* rdb - the remote debugger client object
* This object can be used to send information to the remote debugger running on a node.js server
**/

var rdb = new function(){

    //Set this to true if you want to take over the console and output it to the remote server
    this.hijackConsole = true;

    /**
    * debugURL - set this to be the location of the node server you are trying to debug to.
    **/
    this.debugURL = 'http://cias-sms-nodejs.rit.edu:3000';

    this.socket = io.connect(this.debugURL);

    /**
    * emitClientInfo - A function to provide information to server about the client.
    * edit this if you want to change the information about the client you would like
    * to record on the server
    **/
    this.emitClientInfo = function(){
        this.log("location: " + window.location);
        this.log("appversion: " + window.clientInformation.appVersion);
        this.log("User Agent: " + window.clientInformation.userAgent);
        this.log("Pixel Ratio: " + window.devicePixelRatio);
        this.log("Height: " + window.innerHeight);
        this.log("Width: " + window.innerWidth );
        this.log("prefix: " + this.prefix );
    };

    /**
    * log - writes some information to the log on the server
    *
    * @param data - the data to be written to the log in String form (or other data types
    *        that have been coerced).
    **/
    this.log = function( data ){
        this.socket.emit('debugEvent', this.prefix + data );
    };

    /**
    * setPrefix - a setter function to adjust the prefix
    *
    * @param newPrefix - the new prefix to be used during debugging
    **/
    this.setPrefix = function( newPrefix ){
        this.prefix = newPrefix;
    };

    /**
    * generateRandId - Generates a pseudo-random prefix for the console in case there are more than one
    * device using the console at a time.
    */
    this.generateRandId = function(){
        var id= Math.floor( (Math.random()*100) + (Math.random()*100) + (Math.random()*100) + (Math.random()*100) );
        return id + ": ";
    }

    /**
    * prefix - set this to a prefix for the log file. Every entry in the log will have this prefix
    * assigned to it. This makes it easier to keep certain clients or apps separate
    **/
    this.prefix = this.generateRandId();

};


if( rdb.hijackConsole){
    /**
    * Overwrite the existing log function to hijack it for server debugging use
    **/
    console.log = function(data){
        rdb.log(data);
    }

    /**
    * Overwrite the existing error function to hijack it for server debugging use
    **/
    console.error = function(data){
        rdb.log(data);
    }

    /**
    * Overwrite the existing warn function to hijack it for server debugging use
    **/
    console.warn = function(data){
        rdb.log(data);
    }

    /**
    * Overwrite the existing info function to hijack it for server debugging use
    **/
    console.info = function(data){
        rdb.log(data);
    }

    /**
    * Catch all errors and log them out to the server
    **/
    window.onerror = function(msg,url,line,col,error){
        rdb.log( url + " line:" + line + " column:" + col + " " + msg);
    }

}
