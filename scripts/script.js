// Global objects
var neoApp = {};
neoApp.apiKey = 'RQ9TY8aclxKi35ThMeZ3m2FrdHzggafkHgeYsBvo';
var currentCountofDays = 0;

// JS function to get current date
neoApp.currentDate = function(){
	var startDate = new Date();
	startDate = startDate.yyyymmdd();
	return startDate;
};

// Gets next button's "start date" for API call
neoApp.nextDate = function(currentCountofDays){
	var getTomorrow = moment().add(currentCountofDays, 'days').format('YYYY MM DD');
	var tomorrow = getTomorrow.replace(/ /g, '-');
	return tomorrow;
};

// Gets next button's "end date" for API call
neoApp.nextNextDate = function(currentCountofDays){
	currentCountofDays = currentCountofDays + 1;
	var getTomorrow = moment().add(currentCountofDays, 'days').format('YYYY MM DD');
	var nextEndDate = getTomorrow.replace(/ /g, '-');
	return nextEndDate;
};

// Gets previous button's "start date" for API call
neoApp.prevDate = function(currentCountofDays){
	var getYesterday = moment().add(currentCountofDays, 'days').format('YYYY MM DD');
	var yesterday = getYesterday.replace(/ /g, '-');
	return yesterday;
};

// Gets previous button's "end date" for API call
neoApp.prevPrevDate = function(currentCountofDays){
	currentCountofDays = currentCountofDays + 1;
	var getYesterday = moment().add(currentCountofDays, 'days').format('YYYY MM DD');
	var nextEndDate = getYesterday.replace(/ /g, '-');
	return nextEndDate;
};

// This function gets current date and put into YYYY-MM-DD format
Date.prototype.yyyymmdd = function() {
	var mm = this.getMonth() + 1; // getMonth() is zero-based
	var dd = this.getDate();
	return [this.getFullYear(), '-', !mm[1] && '0', mm, '-', !dd[1] && '0', dd].join(''); 
};


neoApp.init = function() {
	var startDate = neoApp.currentDate();
	
	var endDate = new Date();
	endDate.setDate(endDate.getDate() + 1)
	endDate = endDate.yyyymmdd();
	
	var dataDate = moment().format('YYYY MM DD');
	var dataDate = dataDate.replace(/ /g, '-');

	$('.dataDate').append(`${dataDate}`);

	neoApp.getNext();
	neoApp.getPrev();
	neoApp.getList(startDate, endDate);
}

// Updating a counter, this allows user to click next button and get next day's data
neoApp.getNext = function(){
	$('.nextDate').click(function(goNext){
	
		currentCountofDays = currentCountofDays + 1;

		$('.dataDate').empty();
		goNext.preventDefault();

		var dataDate = moment().add(currentCountofDays,'days').format('YYYY MM DD');
		var dataDate = dataDate.replace(/ /g, '-'); /* reg ex for proper date formatting*/
		$('.dataDate').append(`${dataDate}`);

		var startDate = neoApp.nextDate(currentCountofDays);
		var endDate = neoApp.nextNextDate(currentCountofDays);

		neoApp.getList(startDate, endDate);
	});
};

// Updating a counter, this allows user to click previous button and get previous day's data
neoApp.getPrev = function(){
	$('.prevDate').click(function(goPrev){
		currentCountofDays = currentCountofDays - 1;

		$('.dataDate').empty();
		goPrev.preventDefault();

		var dataDate = moment().add(currentCountofDays,'days').format('YYYY MM DD');
		var dataDate = dataDate.replace(/ /g, '-');
		$('.dataDate').append(`${dataDate}`);

		var startDate = neoApp.prevDate(currentCountofDays);
		var endDate = neoApp.prevPrevDate(currentCountofDays);

		neoApp.getList(startDate, endDate);
	});
}
	
// This sorts objects by nearest miss distance, and picks the first 3 & their data (0,1,2)
neoApp.getList = function(startDate, endDate) {
	neoApp.apiUrl = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${startDate}&end_date=${endDate}`;
	$.ajax({
		url: neoApp.apiUrl,
		method: 'GET',
		dataType: 'json',
		data: {
			api_key: neoApp.apiKey
		}
	}).then(function(neoData){
		if (neoData) {
			var nearObjects = neoData.near_earth_objects[startDate];
			nearObjects = nearObjects.map(function(item){
				return {
					name: item.name,
					distance: item.close_approach_data[0].miss_distance.kilometers,
					diameter: item.estimated_diameter.meters.estimated_diameter_max,
					hazard: item.is_potentially_hazardous_asteroid,
					velocity: item.close_approach_data[0].relative_velocity.kilometers_per_hour
				}
			});
			nearObjects.sort(function(object1, object2){
				return object1.distance - object2.distance;
			});
			var neoOne = nearObjects[0];
			var neoTwo = nearObjects[1];
			var neoThree = nearObjects[2];
			neoApp.displayNeo(neoOne, neoTwo, neoThree);
		} 
		// else {
		// 	alert('Oh no! No data for this date!');
		// 	$('.neoSection').hide;
		// }
	});
};

// This displays datasets for each of nearest 3 NEOs
neoApp.displayNeo = function(neoOne, neoTwo, neoThree) {
	$('.neoText').hide();

	// closest NEO
	neoOneContainer = $('<div>').addClass('neoText').addClass('NEOcontainer');
	var neoOneKms = $('<p>').text('Miss distance: ' + Math.floor(neoOne.distance) + ' km').addClass('accentColor');
	var neoOneName = $('<p>').text('Name: ' + neoOne.name);
	var neoOneVelocity = $('<p>').text('Velocity: ' + Math.floor(neoOne.velocity) + ' km/hr');
	var neoOneSize = $('<p>').text('Max diameter: ' + Math.floor(neoOne.diameter) + ' m');
	var neoOneHazard = $('<p>').text('Potentially hazardous: ' + neoOne.hazard);
	neoOneContainer.append(neoOneKms, neoOneName, neoOneVelocity, neoOneSize, neoOneHazard);
	$('.closeNeo').append(neoOneContainer);
	var pixelVal = neoApp.pixelDistance(neoOne.distance);
	$('.closeNeo').css('top', -pixelVal);

	// second-closest NEO
	var neoTwoContainer = $('<div>').addClass('neoText').addClass('NEOcontainer');
	var neoTwoKms = $('<p>').text('Miss distance: ' + Math.floor(neoTwo.distance) + ' km').addClass('accentColor');
	var neoTwoName = $('<p>').text('Name: ' + neoTwo.name);
	var neoTwoVelocity = $('<p>').text('Velocity: ' + Math.floor(neoTwo.velocity) + ' km/hr');
	var neoTwoSize = $('<p>').text('Max diameter: ' + Math.floor(neoTwo.diameter) + ' m');
	var neoTwoHazard = $('<p>').text('Potentially hazardous: ' + neoTwo.hazard);
	neoTwoContainer.append(neoTwoKms, neoTwoName,neoTwoVelocity, neoTwoSize, neoTwoHazard);
	$('.midNeo').append(neoTwoContainer);
	var pixelVal = neoApp.pixelDistance(neoTwo.distance);
	$('.midNeo').css('top', -pixelVal);

	// third-closest NEO
	var neoThreeContainer = $('<div>').addClass('neoText').addClass('NEOcontainer');
	var neoThreeKms = $('<p>').text('Miss distance: ' + Math.floor(neoThree.distance) + ' km').addClass('accentColor');
	var neoThreeName = $('<p>').text('Name: ' + neoThree.name);
	var neoThreeVelocity = $('<p>').text('Velocity: ' + Math.floor(neoThree.velocity) + ' km/hr');
	var neoThreeSize = $('<p>').text('Max diameter: ' + Math.floor(neoThree.diameter) + ' m');
	var neoThreeHazard = $('<p>').text('Potentially hazardous: ' + neoThree.hazard);
	neoThreeContainer.append(neoThreeKms, neoThreeName, neoThreeVelocity, neoThreeSize, neoThreeHazard);
	$('.farNeo').append(neoThreeContainer);
	var pixelVal = neoApp.pixelDistance(neoThree.distance);
	$('.farNeo').css('top', -pixelVal);	
}

// This makes sure two NEO data groups aren't showing at the same time
$('.neoSection').on('click',function(){
	var $neoText = $(this).find('.NEOcontainer').hasClass('showMe');
	if ($neoText){
		$(this).find('.neoText').removeClass('showMe');
	} else {
		$('.neoText').removeClass('showMe');
		$(this).find('.neoText').addClass('showMe');
	}	
});

// this function divides "miss distance" of asteroid by a number to get a pixel value, which is then used to absolutely position the asteroid. +20(px) represents a correction for total height of png minus empty space at bottom of png.
neoApp.pixelDistance = function(n){
	var neo = parseFloat(n);
	var divide = (Math.floor(neo / 160000))+20;
	return divide 
}

$(function(){
	neoApp.init(); 
});

// TO DO:
// 1. fix for if no data (line ~139)
// 2. make neo data responsive
// 3. copy edit
// 4. BONUS: get asteroid sizes to be correct relations as per API data