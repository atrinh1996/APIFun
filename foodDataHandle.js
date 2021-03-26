/*
 * foodDataHandle.js
 *
 * Main driver, requests data from API and displays adverse food events.
 *
 * Author: Amy Bui
 * HW10
 * Comp20
 * Spring 2021
 */

// Includes my API key
let initialQueryAddress = 'https://api.fda.gov/food/event.json?api_key=GSBBphdbPxMhJcPEeQbYvbmNJ0iS3QU9cjIJHBA5&search=';

$(document).ready(function() {
    $("#displayOptions input[type='button']").click(function() {
        idx = $("#displayOptions input[type='button']").index(this);
        showSection(idx);
    });

    $("#queryBtn").click(function() {
        validateSearch();
    });
});

// display block section indexed at showIdx
function showSection(showIdx) {
    if (showIdx == 2) $(".block").show();   // show all selected
    else {
        $(".block").each(function(currBlockIdx) {
            if (currBlockIdx == showIdx)
                $(this).show();
            else
                $(this).hide();
        });
    }
}

/* requestData
 * Get json data about adverse food events from openFDA.
 * use AJAX.
 */
function requestData(address) {
    // console.log(address);

    // 1. make a request object to make http requests
    var reqObj = new XMLHttpRequest();
    console.log("1 - request object created");

    // 2. Set the URL for the AJAX request to be the JSON file
    reqObj.open("GET", address, true);
    console.log("2 - opened request file")

    // 3. set event handler/callback
    reqObj.onreadystatechange = function () {
        if (reqObj.readyState == 4 && reqObj.status == 200) {
            // 5. wait for done + success
            console.log("5 - response received")

            var result = reqObj.responseText;
            displayRaw(result);

            data = JSON.parse(result);

            displayFoods(data);
            displayReactions(data);

        } else if (reqObj.readyState == 4 && reqObj.status != 200) {
            $("#rawData").html("Something went wrong! Check logs.");
        } else if (reqObj.readyState == 3) {
            $("#rawData").html("Too soon! Try again");
        }
    }

    // 4. fire off http request
    reqObj.send();
    console.log("4 - request sent")
}

/* displayRaw
 * Display raw json data as string called raw
 */
function displayRaw(raw) {
    $("#rawData").html(raw);
}

/* displayFoods
 * Display the name brand products. 
 * data is json object with foods with associated 
 * adversed events reported. Display informations' brand names
 */
function displayFoods(data) {
    let foodList = [];
    data["results"].forEach(function(currObj) {
        currObj["products"].forEach(function (currProd) {
            foodList.push(currProd["name_brand"]);
        });
    });

    // create the html
    let s = "";
    foodList.forEach(function(food, idx) {
        if (idx > 0) s += ",<br>";
        s += food;
    });

    $("#foods").html(s);
}

/* displayReactions
 * Display the types of reactions from the named products. 
 * data is json object with associated data
 */
function displayReactions(data) {
    let outcomes = [];
    data["results"].forEach(function(currObj) {
        currObj["reactions"].forEach(function(currRxn) {
            if (!outcomes.includes(currRxn))
                outcomes.push(currRxn);
        });
    });

    // create the html
    let r = "";
    outcomes.forEach(function(rxn, idx) {
        if (idx > 0) r += ", <br>";
        r += rxn;
    });

    $("#reactions").html(r);
}

// Ensure that enough information is provided for a query.
function validateSearch() {
    // get values from html form
    let brand = $("#brand").val();
    let start = $("#start").val();
    let end = $("#end").val();

    if (brand != "" || (start != "" && end != "")) {
        start = start.split("-").join("");  // format dates
        end = end.split("-").join("");
        newQuery(brand, start, end);    // create rest of query
        return true;
    } else {
        return false;
    }
}

// Creates a new query and call to request for data with 
// given information of name, start, and end. These are formatted
// according to openFDA documentation.
function newQuery(name, start, end) {
    let brandSearch = "";
    let dateSearch = "";
    let queryAddress = initialQueryAddress;

    if (name != "")
        brandSearch += 'products.name_brand:"' + name + '"';
    
    if (start != "" && end != "")
        dateSearch += 'date_started:[' + start + '+TO+' + end + ']';

    if (brandSearch != "") {
        queryAddress += brandSearch;
        if (dateSearch != "") {
            queryAddress += '+AND+';
            queryAddress += dateSearch;
        }
    } else {
        queryAddress += dateSearch;
    }

    queryAddress += '&limit=10';    // add limit to number of records requested

    requestData(queryAddress);
}