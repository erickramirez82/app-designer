'use strict';
/* global $, odkTables */
/* exported display */

var collectButton = $('#collect');
var latitude = 0;
var longitude = 0;
var altitude = 0;
var accuracy = 0;
var watchID=null;

var geolocationSuccess = function(position) {
    if(position && position.coords) {
        showLocationFound(position.coords);
    }
}

var geolocationError = function(error) {
    console.log(error)
    if(error.code == 1) {
        locationProvidersDisabled();
    } else {
        $('#gps_accuracy_spinner').addClass('red_spinner');
    }
}

function showLocationFound(coords) {
    latitude = coords.latitude;
    longitude = coords.longitude;
    altitude = coords.altitude;
    accuracy = Math.floor(coords.accuracy);

    $('#gps_accuracy_spinner').removeClass('green_spinner')
                      .removeClass('orange_spinner')
                      .removeClass('red_spinner')
                      .removeClass('black_spinner');

    if(accuracy >0 && accuracy<=EpsConfig.goodGpsAccuracyThresholds) {
        $('#gps_accuracy_spinner').addClass('green_spinner');
    } else if(accuracy >EpsConfig.goodGpsAccuracyThresholds && accuracy<=EpsConfig.moderateGpsAccuracyThresholds) {
        $('#gps_accuracy_spinner').addClass('orange_spinner');
    } else { 
        $('#gps_accuracy_spinner').addClass('red_spinner');
    }

    $('#gps_accuracy_number').text(accuracy+'m');
}

function locationProvidersDisabled() {
    latitude = null;
    longitude = null;
    altitude = null;
    accuracy = null;
    $('#gps_accuracy_spinner').removeClass('green_spinner')
                      .removeClass('orange_spinner')
                      .removeClass('red_spinner')
                      .removeClass('black_spinner');

    $('#gps_accuracy_spinner').addClass('black_spinner');
    $('#gps_accuracy_number').text('0m');
} 
            
function setupLocation(){
    if(navigator.geolocation){
       getLocation();
    } else{
       locationProvidersDisabled();
    }
}

function getLocation() {
    // timeout at 60000 milliseconds (60 seconds)
    var options = {timeout:60000};
    options.maximumAge = 0; // Force current locations only
    options.enableHighAccuracy = true;
    options.desiredAccuracy=1000;
    watchID = navigator.geolocation.watchPosition(geolocationSuccess, geolocationError, options);
}

Backbone.Model.prototype.idAttribute = '_id';

//Backbone Model

var Census = Backbone.Model.extend({
    defaults: {
        place_name: localStorage.getItem("place_name_selected"),
        house_number: '',
        head_name: '',
        comment: '',
        exclude: '',
        valid:'',
        sample_frame: 0,
        data_selected:'',
        random_number: 0,
        selected: 0,
        location_accuracy: '',
        location_altitude: '',
        location_latitude: '',
        location_longitude: '',
        questionnaire_status: ''
    }
});

//Backbone Collection

var Censuses = Backbone.Collection.extend({
    url: ''
});

var censuses = new Censuses();


Backbone.sync = function(method, model, options) {
    if (method === "read") {
        syncRead(method, model, options);
    } else if(method === "update") {
        syncUpdate(method, model, options);
    } else if(method === "create"){
        syncCreate(method, model, options);
    }
};

function syncRead(method,  model, options) {
    var successFnRead = function( result ) {
        var allRows = [];
        for (var row = 0; row < result.getCount(); row++) {
            var data = {};
            data['_id']= result.getData(row,"_id");
            data['place_name']= result.getData(row, "place_name");
            data['house_number']= result.getData(row,"house_number");
            data['head_name']= result.getData(row,"head_name");
            data['comment']= result.getData(row,"comment");
            data['exclude']=result.getData(row,"exclude");
            data['valid']=result.getData(row,"valid");
            data['sample_frame']=result.getData(row,"sample_frame");
            data['date_selected']=result.getData(row,"date_selected");
            data['random_number']= result.getData(row,"random_number");
            data['selected']= result.getData(row,"selected");
            data['location_accuracy']= result.getData(row,"location_accuracy");
            data['location_altitude']= result.getData(row,"location_altitude");
            data['location_latitude']= result.getData(row,"location_latitude");
            data['location_longitude']= result.getData(row,"location_longitude");
            data['questionnaire_status']= result.getData(row,"questionnaire_status");
            allRows.push(data);
        }

        // If it's not a collection, use first value only
        if(_.isUndefined(model.models)) {
            allRows = allRows[0] || null;
        }

        if(options.async === false) {
            options.success(allRows, 'success', null);
        } else {
            // simulate a normal async network call
            setTimeout(function(){
                options.success(allRows, 'success', null);
            }, 0);
        } 
    }

    var failureFnRead = function( errorMsg) {
        if(options.async === false) {
            options.error(null, 'Failed', null);
        } else {
            // simulate a normal async network call
            setTimeout(function(){
                options.error(null, 'Failed', null);
            }, 0);
        } 
    }

    odkData.query('census', 'place_name=?', [localStorage.getItem("place_name_selected")], null, null,
        null, null, null, null, null, successFnRead,
        failureFnRead);
}

function syncUpdate(method,  model, options) {
    var data = {};
    data['place_name']= model.attributes.place_name;
    data['house_number']= model.attributes.house_number;
    data['head_name']= model.attributes.head_name;
    data['comment']= model.attributes.comment;
    data['exclude']= model.attributes.exclude;
    
    if($('#replace_gps').prop('checked')) {
        data['valid']= model.attributes.valid;
        data['location_accuracy']= model.attributes.location_accuracy;
        data['location_altitude']= model.attributes.location_altitude;
        data['location_latitude']= model.attributes.location_latitude;
        data['location_longitude']= model.attributes.location_longitude;
    }
           
    var successFnUpdate = function( result ) {
        if(options.async === false) {
            options.success(null, 'success', null);
        } else {
            // simulate a normal async network call
            setTimeout(function(){
                options.success(null, 'success', null);
            }, 0);
        } 
    }

    var failureFnUpdate = function( errorMsg) {
        console.log(errorMsg);
        if(options.async === false) {
            options.error(null, 'Failed', null);
        } else {
            // simulate a normal async network call
            setTimeout(function(){
                options.error(null, 'Failed', null);
            }, 0);
        } 
    }

    odkData.updateRow('census', data, model.attributes._id, successFnUpdate, 
        failureFnUpdate);
}

function syncCreate(method,  model, options) {
    var data = {};
    data['place_name']= model.attributes.place_name;
    data['house_number']= model.attributes.house_number;
    data['head_name']= model.attributes.head_name;
    data['comment']= model.attributes.comment;
    data['exclude']= model.attributes.exclude;
    data['selected']= model.attributes.selected;
    data['sample_frame']= model.attributes.sample_frame;
    data['random_number']= model.attributes.random_number;
    data['valid']= model.attributes.valid;
    data['location_accuracy']= model.attributes.location_accuracy;
    data['location_altitude']= model.attributes.location_altitude;
    data['location_latitude']= model.attributes.location_latitude;
    data['location_longitude']= model.attributes.location_longitude;
           
    var successFnCreate = function( result ) {
        if(options.async === false) {
            options.success(null, 'success', null);
        } else {
            // simulate a normal async network call
            setTimeout(function(){
                options.success(null, 'success', null);
            }, 0);
        } 
    }

    var failureFnCreate = function( errorMsg) {
        console.log(errorMsg);
        if(options.async === false) {
            options.error(null, 'Failed', null);
        } else {
            // simulate a normal async network call
            setTimeout(function(){
                options.error(null, 'Failed', null);
            }, 0);
        } 
    }

    odkData.addRow('census', data, EpsUtils.generateUUID(), successFnCreate, 
        failureFnCreate);
}

var rowBeingUpdated=null;
//Backbone View for one census
var CensusView = Backbone.View.extend({
    model: new Census(),
    tagName: 'tr',
    initialize: function() {
        this.template = _.template($('.census-list-template').html());
    },
    events: {
        'click .edit-census': 'edit'
        /*'click #update-census': 'update',
        'click #cancel': 'cancel'*/
    },
    edit: function() {
        rowBeingUpdated = this;
        $('.edit-census').hide();
        $('#save').hide();
        $('#update-census').show();
        $('#cancel').show();
        $('#replace_gps_div').show();
        
        $('#headName').val(this.$(".head_name").html());
        $('#houseNum').val(this.$(".house_number").html());
        $('#comment').val(this.$(".comment").val());
        
        if(this.$(".exclude").val() === "1") {
            $('#exclude').prop('checked', true);
        } else {
            $('#exclude').prop('checked', false);
        }

        $('#replace_gps').prop('checked', false);
        $(window).scrollTop(0);
    },
    update: function() {
        if (validateData($('#replace_gps').prop('checked'))) {
            this.model.set('house_number', $('#houseNum').val());
            this.model.set('head_name', $('#headName').val());
            this.model.set('comment', $('#comment').val());
            var exclude = $('#exclude').prop('checked') === true ? 1 : 0;
            this.model.set('exclude', exclude);
            
            if($('#replace_gps').prop('checked')) {
                var valid = ((accuracy > 0 && accuracy <= EpsConfig.goodGpsAccuracyThresholds) ? 1:0);
                this.model.set('valid', valid);
                this.model.set('location_accuracy', accuracy);
                this.model.set('location_altitude', altitude);
                this.model.set('location_latitude', latitude);
                this.model.set('location_longitude', longitude);
            } 
            
            // in addition to making changes to our model, this method send a PUT request to our server.
            this.model.save(null, {
                success: function(response) {
                    console.log('Successfully UPDATED census with _id: ' + response.toJSON()._id);
                    alert("Census updated.");
                    prepScreenForNewCensus();
                },
                error: function(response) {
                    console.log('Failed to update census!');
                    alert("Unable to update census.");
                    prepScreenForNewCensus();
                }
            });
        }
    },
    cancel: function() {
        censusesView.render();
        prepScreenForNewCensus();
    },
    render: function() {
        this.$el.html(this.template(this.model.toJSON()));
        // mark each record as either valid, invalid or excluded
        if(this.model.attributes.exclude ===1) {
            this.$('.badge').html('E');
        } else if(this.model.attributes.valid ===1) {
            this.$('.badge').html('V');
        } else {
            this.$('.badge').html('I');
        }
        return this;
    }
});

function prepScreenForNewCensus() {
    refreshScreenAfterCancel();
    clearControlValues();
    lastPlusOne();
}

function refreshScreenAfterUpdate() {
    $('.edit-census').show();
    $('#save').show();
    $('#update-census').hide();
    $('#cancel').hide();
    $('#replace_gps_div').hide();
    $('#exclude').prop('checked', false);
    $('#replace_gps').prop('checked', false);
}

function refreshScreenAfterCancel() {
    $('#save').show();
    $('#update-census').hide();
    $('#cancel').hide();
    $('#replace_gps_div').hide();
    $('#exclude').prop('checked', false);
    $('#replace_gps').prop('checked', false);
}

//Backbone View for all censuses
// The model for this view will be the collection i created above in this file
// The el is the tbody I created in the index.html
// When ever a new census is added to the model i.e. the collection, render function of this view gets executed
var CensusesView = Backbone.View.extend({
    model:censuses,
    el:$('.census-list'),
    initialize: function() {
        var self = this;
        this.model.on('add', this.render, this);
        this.model.on('change', function() {
            setTimeout(function() {
                self.render();
            }, 30);
        }, this);
        this.model.on('remove', this.render, this);
        //fetch data from ODK database.
        this.model.fetch({
            success : function(response) {
                _.each(response.toJSON(), function(item) {
                    console.log('Successfully GOT census with _id: ' + item._id);
                });
            }, 
            error: function() {
                console.log("Failed to get census!");
            }
        });
    },
    render: function() {
        var self = this;
        var valid=0, invalid =0, exclude=0;
        this.$el.html('');// clear the el
        _.each(this.model.toArray(), function(census) {
            if(census.attributes.exclude ===1) {
                exclude++;
            } else if(census.attributes.valid ===1) {
                valid++;
            } else {
                invalid++;
            }
            
            self.$el.append((new CensusView({model: census})).render().el);
        });
        $('#num_valid').html(valid);
        $('#num_invalid').html(invalid);
        $('#num_excluded').html(exclude);
        
        return this;
    }
});
var censusesView = new CensusesView();

function validateData(checkGPS) {
    if($('#houseNum').val().trim().length === 0) {
        alert('Error: Missing required field [House Number]. Data is not saved.');
        return false;
    } else if($('#headName').val().trim().length === 0){
        alert('Error: Missing required field [Head Name]. Data is not saved.');
        return false;
    } else if(checkGPS===true && (accuracy===0 || accuracy > EpsConfig.goodGpsAccuracyThresholds)) {
        if(confirm("Data from GPS is not valid. Continue saving? Accuracy " + accuracy + " m.")) {
            return true;
        } else {
            return false;
        }
    } 
    return true;
}

function save() {
    var exclude = $('#exclude').prop('checked') === true ? 1 : 0;
    var valid = ((accuracy > 0 && accuracy <= EpsConfig.goodGpsAccuracyThresholds) ? 1:0);
    var census = new Census({
            place_name: localStorage.getItem("place_name_selected"),
            house_number: $('#houseNum').val(),
            head_name: $('#headName').val(),
            comment: $('#comment').val(),
            exclude: exclude,
            valid: valid,
            sample_frame: 0,
            random_number: 0,
            selected: 0,
            location_accuracy: accuracy,
            location_altitude: altitude,
            location_latitude: latitude,
            location_longitude: longitude
        });
        
    censuses.add(census);

    census.save(null, {

        success: function(response) {
            console.log('Successfully UPDATED census with _id: ' + response.toJSON()._id);
            alert("Census saved.");
            lastPlusOne();
        },
        error: function(response) {
            console.log('Failed to update census!');
            alert("Unable to save census.");
            lastPlusOne();
        }
        
    });
}

function clearControlValues() {
    $('#headName').val("");
    $('#comment').val("");
}

function generateLastIDPlus1() {

    var successFnPlus1 = function( result ) {
        // if you find the max house number, then add one on it and update the screen
        if(result.getCount()>0) {
            if(result.getData(0,"house_number") !== null) {
                $("#houseNum").val(parseInt(result.getData(0,"house_number")) + 1);
            } else {
                $("#houseNum").val('1');
            }
        } else {
            // if there is no record, put one in the house number textbox
            $("#houseNum").val('1');
        }
    }

    var failureFnPlus1 = function( errorMsg) {
        console.log('Failed to read census table');
        $("#houseNum").val('1');
    }

    odkData.arbitraryQuery('census', "select max(house_number) as house_number from census where place_name=?", 
        [localStorage.getItem("place_name_selected")], null, null, successFnPlus1, failureFnPlus1);
}

function lastPlusOne() {
    refreshScreenAfterCancel();
    clearControlValues();
    $('.edit-census').show();
    generateLastIDPlus1();
}

function successFnInit() {
    // check that the user saved empty value in the setting. If so, use 10 and 50 as default values
    EpsConfig.goodGpsAccuracyThresholds = $.isNumeric( EpsConfig.goodGpsAccuracyThresholds ) ? parseInt(EpsConfig.goodGpsAccuracyThresholds) : 10;
    EpsConfig.moderateGpsAccuracyThresholds = $.isNumeric( EpsConfig.moderateGpsAccuracyThresholds ) ? parseInt(EpsConfig.moderateGpsAccuracyThresholds) : 50;
}

$(document).ready(function() {
    setupLocation();
    EpsConfig.init(successFnInit, null);
    
    $('#save').on('click', function() {
        if(validateData(true)) {
            save();
        }
    });

    $('#update-census').on('click', function() {
        rowBeingUpdated.update();
    });

    $('#cancel').on('click', function() {
        rowBeingUpdated.cancel();
    });
    $('#plus1').on('click', function() {
        // if the screen is in the update mode, cancel it.
        lastPlusOne()
    });
});

$(window).on('beforeunload', function(){
    console.log("beforeUnload event!");
    if(watchID !== null) {
        navigator.geolocation.clearWatch(watchID);
    }
});