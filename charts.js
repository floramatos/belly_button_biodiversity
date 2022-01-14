function init() {
  // Grab a reference to the dropdown select element
  let selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("samples.json").then((data) => {
    let sampleNames = data.names;

    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    let firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

// Initialize the dashboard
init();

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildMetadata(newSample);
  buildCharts(newSample);
};

// Demographics Panel 
function buildMetadata(sample) {
  d3.json("samples.json").then((data) => {
    let metadata = data.metadata;
    // Filter the data for the object with the desired sample number
    let resultArray = metadata.filter(sampleObj => sampleObj.id == sample);
    let result = resultArray[0];
    // Use d3 to select the panel with id of `#sample-metadata`
    let PANEL = d3.select("#sample-metadata");

    // Use `.html("") to clear any existing metadata
    PANEL.html("");

    // Use `Object.entries` to add each key and value pair to the panel
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.
    Object.entries(result).forEach(([key, value]) => {
      PANEL.append("h6").text(`${key.toUpperCase()}: ${value}`);
    });
  });
}

// Create the buildCharts function.
function buildCharts(sample) {
  // Use d3.json to load and retrieve the samples.json file 
  d3.json("samples.json").then((data) => {
    console.log(data);
    // Create a variable that filters the samples for the object with the desired sample number.
    let samplesArray = data.samples.filter(sampleObj => sampleObj.id == sample);
    console.log(samplesArray);

    // Create a variable that filters the metadata array for the object with the desired sample number.
    let metadataArray = data.metadata.filter(sampleObj => sampleObj.id == sample);
    console.log(metadataArray);

    //  Create a variable that holds the first sample in the array.
    let resultSamples = samplesArray[0];
    console.log(resultSamples);

    // Create a variable that holds the first sample in the metadata array.
    let resultMetadata = metadataArray[0];
    console.log(resultMetadata);

    // Create variables that hold the otu_ids, otu_labels, and sample_values.
    let otuID = resultSamples.otu_ids;
    console.log(otuID);
    let otuLabels = resultSamples.otu_labels;
    console.log(otuLabels);
    let sampleValues = resultSamples.sample_values;
    console.log(sampleValues);

    // Create a variable that holds the washing frequency.
    let wfreq = parseFloat(resultMetadata.wfreq).toFixed(1);
    console.log(wfreq);

    // Create the yticks for the bar chart.
    // Get the the top 10 otu_ids and map them in descending order 
    //combine the arrays to sort them and filter top 10
    let list = [];
    for (let j = 0; j < otuID.length; j++) 
        list.push({'OTU_ID': otuID[j], 'SAMPLE_VALUES': sampleValues[j], 'OTU_LABELS': otuLabels[j]});
    console.log(list);
    let top10 = list.sort((a, b) => b.SAMPLE_VALUES - a.SAMPLE_VALUES).slice(0,10).reverse();
    console.log(top10)

    // Map out_ids to convert array of strings
    let ID = top10.map(a => a.OTU_ID)
    console.log(ID)
    let stringID = ID.map(String)
    console.log(stringID)

    // Create the trace for the bar chart. 
    let barData = {
      x: top10.map(a => a.SAMPLE_VALUES),
      y: stringID.map(i => "OTU " + i),
      text: top10.map(a => a.OTU_LABELS),
      type: "bar",
      orientation: "h"
    };

    // Create the layout for the bar chart. 
    let barLayout = {
      title: "Top 10 Bacteria Cultures Found",
      yaxis: {
        type: 'category'
        },
      paper_bgcolor: "rgba(0,0,0,0)"
      };

    // Use Plotly to plot the data with the layout. 
    Plotly.newPlot("bar", [barData], barLayout)

    // Bubble chart
    // Create the trace for the bubble chart.
    var bubbleData = [{
      x: list.map(a => a.OTU_ID).reverse(),
      y: list.map(a => a.SAMPLE_VALUES).reverse(),
      mode: 'markers',
      text: list.map(a => a.OTU_LABELS).reverse(),
      marker: {
        color: list.map(a => a.OTU_ID).reverse(),
        size: list.map(a => a.SAMPLE_VALUES).reverse()}
    }];

    // Create the layout for the bubble chart.
    var bubbleLayout = {
      title: "Bacteria Cultures per Sample",
      xaxis:{
        title: "OTU ID"
      },
      hovermode: "x",
      paper_bgcolor: "rgba(0,0,0,0)"
    };

    // Use Plotly to plot the data with the layout.
    Plotly.newPlot("bubble", bubbleData, bubbleLayout);

    // 4. Create the trace for the gauge chart.
    var gaugeData = [{
      value: wfreq,
      title: { text: "<b>Belly Button Washing Frequency</b><br>Scrubs per Week"},
      //  "Scrubs per Week"]},
        // <h2>Scrubs per Week<h2>},
      type: "indicator",
      mode: "gauge+number",
      gauge: {
        axis: { range: [0, 10] },
        bar: { color: "gray" },
        steps: [
          { range: [0, 2], color: "linen" },
          { range: [2, 4], color: "peachpuff" },
          { range: [4, 6], color: "sandybrown" },
          { range: [6, 8], color: "chocolate" },
          { range: [8, 10], color: "sienna" },
        ],
      },
        
    }];
    
    // 5. Create the layout for the gauge chart.
    var gaugeLayout = { 
      width: 500,
      height: 400,
      margin: {t: 0, b: 0},
      paper_bgcolor: "rgba(0,0,0,0)"
    };

    // 6. Use Plotly to plot the gauge data and layout.
    Plotly.newPlot("gauge", gaugeData, gaugeLayout);
  });
}
