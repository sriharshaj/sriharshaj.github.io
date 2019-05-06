let CAYoutubeDataLink = "https://raw.githubusercontent.com/sriharshaj/youtube-data/master/CAvideos_short.csv";
let INYoutubeDataLink = "https://raw.githubusercontent.com/sriharshaj/youtube-data/master/INvideos_short.csv";
let GBYoutubeDataLink = "https://raw.githubusercontent.com/sriharshaj/youtube-data/master/GBvideos_short.csv";
let USYoutubeDataLink = "https://raw.githubusercontent.com/sriharshaj/youtube-data/master/USvideos_short.csv";
let CAYoutubeData;
let INYoutubeData;
let GBYoutubeData;
let USYoutubeData;
let streamGraphDivId = "stream-graph";
let barGraphDivId = "bar-graph";
let lineChartDivId = "line-chart";
let countries = ["Cananda", "India", "UK", "US"];
let category = undefined;

let streamGraphIdxHistory = [];

const categoryIds = ["1", "2", "10", "15", "17", "19", "20", "22", "23", "24", "25", "26", "27", "28", "29", "30", "43"];
const categories = {
  "1": "Film & Animation",
  "2": "Autos & Vehicles",
  "10": "Music",
  "15": "Pets & Animals",
  "17": "Sports",
  "19": "Travel & Events",
  "20": "Gaming",
  "22": "People & Blogs",
  "23": "Comedy",
  "24": "Entertainment",
  "25": "News & Politics",
  "26": "Howto & Style",
  "27": "Education",
  "28": "Science & Technology",
  "29": "Miscellaneous",
  "30": "Movies",
  "43": "Shows"
};
const countryColors = ["0E233D", "214956", "6AAE9A", "BACCA1"];
const colors = {
  "1": "#7D8F7A",
  "2": "#ABB896",
  "10": "#F4AD72",
  "15": "#D96459",
  "17": "#9E463F",
  "19": "#5C6769",
  "20": "#A8B2A1",
  "22": "#EEE9A5",
  "23": "#AEB14F",
  "24": "#C35726",
  "25": "#FB2E1F",
  "26": "#6BC3BA",
  "27": "#45ABA3",
  "28": "254B69",
  "29": "#676868",
  "30": "#F5B28C",
  "43": "#6C3230"
};

function populateSelect(selectId) {
  d3.select(`#${selectId}`)
    .selectAll("option")
    .data(["All"].concat(Object.keys(categories)))
    .enter()
    .append("option")
    .attr("value", (d) => d)
    .text((d) => d == "All" ? "All" : categories[d]);
}
populateSelect("categoriesSelect");

function populateTrendSelect(selectId) {
  d3.select(`#${selectId}`)
    .selectAll("option")
    .data(countries)
    .enter()
    .append("option")
    .attr("value", (d, i) => i)
    .text((d) => d);
}
populateTrendSelect("trendCountrySelect");

function createStreamGraph(divId, data) {
  let dates = Object.keys(data);
  streamGraphIdxHistory.push([0, dates.length, undefined]);
  let svgWidth = 800;
  let svgHeight = 600;
  let svgTopMargin = 0;
  let xScale = svgWidth / dates.length;
  let yScale = d3.scaleLinear([0, svgHeight]).domain([0, 1]);
  let svg = d3.select(`#${divId}`).append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);


  let toolTipDiv = d3.select("body").append("div")
    .style("position", "absolute")
    .style("z-index", "20")
    .style("width", "150px")
    .style("height", "40px")
    .style("text-align", "center")
    .style("background-color", "#fff")
    .style("visibility", "hidden");

  for (let idx = 0; idx < dates.length - 1; idx++) {
    let date1 = dates[idx];
    let date2 = dates[idx + 1];
    let prevY1 = svgTopMargin;
    let prevY2 = svgTopMargin;
    let fractionSumCountry1;
    let fractionSumCountry2;
    let prevY1ByCountry;
    let prevY2ByCountry;
    for (let idx1 = 0; idx1 < 68; idx1++) {
      if (idx1 % 4 == 0) {
        fractionSumCountry1 = 0;
        fractionSumCountry2 = 0;
        for (let idx2 = 0; idx2 < 4; idx2++) {
          fractionSumCountry1 += data[date1][idx1 + idx2]["value"]
          fractionSumCountry2 += data[date2][idx1 + idx2]["value"]
        }
        prevY1ByCountry = 0;
        prevY2ByCountry = 0;
      }
      let Y1 = data[date1][idx1]["value"];
      let Y2 = data[date2][idx1]["value"];
      let Y1ByCountry = isFinite(Y1 / fractionSumCountry1) ? Y1 / fractionSumCountry1 : 0;
      let Y2ByCountry = isFinite(Y2 / fractionSumCountry2) ? Y2 / fractionSumCountry2 : 0;

      svg.append("path")
        .datum({
          idx: idx, date: date1, prevY1: prevY1, prevY2: prevY2, Y1: Y1, Y2: Y2,
          Y1ByCountry: Y1ByCountry, Y2ByCountry: Y2ByCountry,
          prevY1ByCountry: prevY1ByCountry, prevY2ByCountry: prevY2ByCountry,
          data: data[date1][idx1]
        })
        .attr("d", (d) => `M${d.idx * xScale} ${yScale(d.prevY1)} L ${(d.idx + 1) * xScale} ${yScale(d.prevY2)}
       V ${yScale(d.prevY2 + d.Y2)} L ${d.idx * xScale} ${yScale(d.prevY1 + d.Y1)}`)
        .attr("fill", colors[data[date1][idx1]["category_id"]])
        .on("click", function (d) {
          if (d3.event.defaultPrevented) return;
          let startIdx = streamGraphIdxHistory.slice(-1)[0][0];
          let endIdx = streamGraphIdxHistory.slice(-1)[0][1];
          category = d.data.category_id;
          reDrawStreamGraph(divId, startIdx, endIdx, category);
        })
        .on("mouseover", function (d) {
          // if (d3.event.defaultPrevented) return;
          let content = (category == undefined) ? categories[d.data.category_id] : countries[d.data.country_id];
          toolTipDiv.html(`<div>${content}<br> ${d.date.slice(0, -42)}</div>`)
            .style("left", 10 + d3.event.pageX + "px")
            .style("top", 10 + d3.event.pageY + "px")
            .style("visibility", "visible");
        })
        .on("mouseout", function () {
          toolTipDiv.style("visibility", "hidden");
        });
      // .attr("stroke", colors[data[date1][idx1]["category_id"]]);
      prevY1 += Y1;
      prevY2 += Y2;
      prevY1ByCountry += Y1ByCountry;
      prevY2ByCountry += Y2ByCountry;
    }
  }

  svg.selectAll("path").call(d3.drag()
    .on("start", drawSelectRect)
    .on("drag", dragged)
    .on("end", dragEnd)
  );
  function drawSelectRect(d) {
    svg.append("rect")
      .datum({ startPoint: d3.event.x, startIndex: d.idx })
      .attr("id", "selectRect")
      .attr("x", d3.event.x)
      .attr("y", 0)
      .attr("height", 600)
      .attr("width", 0)
      .attr("fill", "#fff")
      .attr("opacity", "0.5");
  }
  function dragged() {
    svg.select("#selectRect")
      .attr("width", (d) => Math.abs(d3.event.x - d.startPoint))
      .attr("x", (d) => d.startPoint > d3.event.x ? d3.event.x : d.startPoint);
  }
  function dragEnd(d) {
    let startIdx, endIdx;
    svg.select("#selectRect").datum(function (x) {
      let pStartIdx = streamGraphIdxHistory.slice(-1)[0][0];
      let pEndIdx = streamGraphIdxHistory.slice(-1)[0][1];
      let scale = svgWidth / (pEndIdx - pStartIdx);
      if (d3.event.x > x.startPoint) {
        startIdx = d.idx;
        endIdx = Math.floor(d.idx + (d3.event.x - x.startPoint) / scale);
      }
      else {
        startIdx = Math.floor(d.idx - (x.startPoint - d3.event.x) / scale);
        endIdx = d.idx;
      }
    }).remove();
    if (startIdx != endIdx) {
      reDrawStreamGraph(divId, startIdx, endIdx, category);
    }
  }
  d3.select("#categoryFlow #legend")
    .append("g")
    .attr("id", "categoriesLegend")
    .selectAll("div")
    .data(Object.keys(categories))
    .enter()
    .append("div")
    .text((d) => categories[d]);

  d3.select("#categoryFlow #legend")
    .append("g")
    .style("visibility", "hidden")
    .attr("id", "countriesLegend")
    .selectAll("div")
    .data(countries)
    .enter()
    .append("div")
    .text((d) => d);
}

function goBackStreamGraph(input) {
  let startIdx, endIdx;
  if (input == "home") {
    startIdx = streamGraphIdxHistory[0][0];
    endIdx = streamGraphIdxHistory[0][1];
    category = streamGraphIdxHistory[0][2];
    streamGraphIdxHistory = [[startIdx, endIdx, category]];
  }
  else {
    startIdx = streamGraphIdxHistory.slice(-2)[0][0];
    endIdx = streamGraphIdxHistory.slice(-2)[0][1];
    category = streamGraphIdxHistory.slice(-2)[0][2];
    if (streamGraphIdxHistory.length > 1) {
      streamGraphIdxHistory.pop();
    }
  }
  reDrawStreamGraph("stream-graph", startIdx, endIdx, category, true);
}

function selectCategoryReDrawStreamGraph(selectObject) {
  let startIdx, endIdx;
  startIdx = streamGraphIdxHistory[0][0];
  endIdx = streamGraphIdxHistory[0][1];
  if (selectObject.value == "All") {
    category = undefined;
  }
  else {
    category = selectObject.value;
  }
  reDrawStreamGraph("stream-graph", startIdx, endIdx, category);
}

function reDrawStreamGraph(divId, startIdx, endIdx, category, undo = false) {
  let svg = d3.select(`#${divId}`).select("svg");
  let noOfDays = endIdx - startIdx;
  d3.select('#categoriesSelect').property('value', category == undefined ? "All" : category);
  if (!undo) {
    streamGraphIdxHistory.push([startIdx, endIdx, category]);
  }
  let svgWidth = 800;
  let svgHeight = 600;
  let xScale = svgWidth / noOfDays;
  let yScale = d3.scaleLinear([0, svgHeight]).domain([0, 1]);
  if (category == undefined) {
    svg.selectAll("path")
      .transition().duration(1000)
      .attr("d", (d) => `M${(d.idx - startIdx) * xScale} ${yScale(d.prevY1)} L ${(d.idx - startIdx + 1) * xScale} ${yScale(d.prevY2)}
      V ${yScale(d.prevY2 + d.Y2)} L ${(d.idx - startIdx) * xScale} ${yScale(d.prevY1 + d.Y1)}`)
      .attr("fill", d => colors[d.data.category_id]);

    d3.select("#countriesLegend").style("visibility", "hidden");
    d3.select("#categoriesLegend").style("visibility", "visible");
  }
  else {
    d3.select("#countriesLegend").style("visibility", "visible");
    d3.select("#categoriesLegend").style("visibility", "hidden");
    let categoryIdxHash = {};
    categoryIds.forEach(function (c, i) {
      categoryIdxHash[c] = i;
    });
    let initalY = categoryIdxHash[category];

    svg.selectAll("path")
      .transition().duration(1000)
      .attr("d", (d) => `M${(d.idx - startIdx) * xScale} ${yScale(d.prevY1ByCountry) + (-initalY + categoryIdxHash[d.data.category_id]) * svgHeight}
        L ${(d.idx - startIdx + 1) * xScale} ${yScale(d.prevY2ByCountry) + (-initalY + categoryIdxHash[d.data.category_id]) * svgHeight}
      V ${yScale(d.prevY2ByCountry + d.Y2ByCountry) + (-initalY + categoryIdxHash[d.data.category_id]) * svgHeight}
      L ${(d.idx - startIdx) * xScale} ${yScale(d.prevY1ByCountry + d.Y1ByCountry) + (-initalY + categoryIdxHash[d.data.category_id]) * svgHeight}`)
      .attr("fill", d => `#${countryColors[d.data.country_id]}`);
  }

}

function createBarGraph(divId, data) {
  let svgLeftMargin = 50;
  let svgRightMargin = 400;
  let svgTopMargin = 50;
  let svgBottomMargin = 50;
  let barWidth = 30;
  let maxBarHeight = 500;
  let svgWidth = svgLeftMargin + barWidth * data.length + svgRightMargin;
  let svgHeight = svgTopMargin + maxBarHeight + svgBottomMargin;
  let verticalScale = d3.scaleLinear([maxBarHeight, 0]).domain([0, data[0][0]]);
  let toolTipDiv = d3.select("body").append("div")
    .style("position", "absolute")
    .style("z-index", "20")
    .style("width", "150px")
    .style("height", "40px")
    .style("text-align", "center")
    .style("background-color", "#fff")
    .style("visibility", "hidden");
  let svg = d3.select(`#${divId}`).append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);
  svg.selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", (d, idx) => idx * barWidth + svgLeftMargin)
    .attr("y", (d) => verticalScale(d[0]))
    .attr("width", barWidth - 5)
    .attr("height", (d) => maxBarHeight - verticalScale(d[0]))
    .attr("fill", "#E96632")
    .on("mouseover", function (d) {
      toolTipDiv.html(`<div>${d[1]}</div>`)
        .style("left", 10 + d3.event.pageX + "px")
        .style("top", 10 + d3.event.pageY + "px")
        .style("visibility", "visible");
    })
    .on("mouseout", function () {
      toolTipDiv.style("visibility", "hidden");
    });
  svg.append("line")
    .attr("x1", svgLeftMargin)
    .attr("x2", barWidth * data.length + 10 + svgLeftMargin)
    .attr("y1", maxBarHeight)
    .attr("y2", maxBarHeight)
    .attr("stroke", "black");

  svg.append("line")
    .attr("x1", svgLeftMargin)
    .attr("x2", svgBottomMargin)
    .attr("y1", 0)
    .attr("y2", maxBarHeight)
    .attr("stroke", "black");

  svg.selectAll("text")
    .data(data)
    .enter()
    .append("text")
    .attr("x", 700)
    .attr("y", (d, idx) => (idx + 1) * 20)
    .text((d) => d[1]);
  svg.append("text")
    .attr("x", svgLeftMargin - 30)
    .attr("y", 15)
    .text("high");
  svg.append("text")
    .attr("x", svgLeftMargin - 10)
    .attr("y", maxBarHeight)
    .text(0);
  svg.append("text")
    .attr("x", 300)
    .attr("y", maxBarHeight + 10)
    .text("channels");

}

function formateDate(date) {
  let [year, day, month] = date.split(".");
  return new Date(`20${year}`, month - 1, day);
}

function videosCountByCategory(videos) {
  let countVideosByCategory = {};
  for (let video of videos) {
    let trendingDate = video["trending_date"];
    let videoCategory = video["category_id"];
    if (countVideosByCategory[trendingDate] === undefined) {
      countVideosByCategory[trendingDate] = {};
      for (let categoryId of categoryIds) {
        countVideosByCategory[trendingDate][categoryId] = 0;
      }
      countVideosByCategory[trendingDate][videoCategory] = 1;
    }
    else {
      countVideosByCategory[trendingDate][videoCategory]++;
    }
  }
  return countVideosByCategory;
}

function addRankToVideo(videos) {
  let trendingDate = videos[0]['trending_date'];
  let trendRank = 1;
  for (let video of videos) {
    if (video["trending_date"] != trendingDate) {
      trendRank = 1;
      trendingDate = video["trending_date"];
    }
    video["trending_rank"] = trendRank;
    trendRank += 1;
  }
  return videos;
}

function mergeJSONObjects(json1, json2) {
  let keys = new Set(Object.keys(json1).concat(Object.keys(json2)));
  let mergedJSON = {};
  for (let key of keys) {
    if (typeof (json1[key]) === "object") {
      mergedJSON[key] = mergeJSONObjects(json1[key], json2[key]);
    }
    else if (typeof (json1[key]) === "number") {
      mergedJSON[key] = (json1[key] || 0) + (json2[key] || 0)
    }
  }
  return mergedJSON;
}

function trendsByChannel(videos) {
  let channelTrendDaysCount = {};
  for (let video of videos) {
    let channelTitle = video['channel_title'];
    channelTrendDaysCount[channelTitle] = (channelTrendDaysCount[channelTitle] || 0) + 1;
  }
  return channelTrendDaysCount;
}

function sortObjectByValues(jsonObj) {
  let sortedArray = [];
  for (let key of Object.keys(jsonObj)) {
    sortedArray.push([jsonObj[key], key]);
  }
  return sortedArray.sort((a, b) => b[0] - a[0]);
}

function formateDataForStreamGraph(data) {
  let dates = Object.keys(data[0]);
  let streamGraphData = {};
  for (let date of dates) {
    let [year, day, month] = date.split(".");
    let parsedDate = new Date(`20${year}`, month - 1, day);
    let dayData = data.map(function (d, countryId) {
      return Object.keys(d[date]).map(function (categoryId) {
        return { value: d[date][categoryId], country_id: countryId, category_id: categoryId }
      });
    });
    dayData = [].concat(dayData[0], dayData[1], dayData[2], dayData[3]);
    dayData.sort((a, b) => a["category_id"] - b["category_id"]);
    let totalCount = dayData.reduce((acc, value) => acc + value["value"], 0);
    dayData.forEach(d => d["value"] = d["value"] / totalCount);
    streamGraphData[parsedDate] = dayData;
  }
  return streamGraphData;
}

function buidDataForLineGraph(data) {
  return data.map((da, i) => d3.nest().key(d => d.video_id)
    .rollup(function (v) {
      return (v.map(d => d.trending_rank)).slice(0, 7)
    }).entries(da).map(d => d.value));
}

function calculateBinData(trendsData) {
  let binSize = 20;
  let calculatedBinData = [];
  for (let j = 0; j < 7; j++) {
    calculatedBinData.push({})
  }

  for (let trends of trendsData) {
    let binData = [...Array(trends.length - 1).keys()].map((d) => [parseInt((trends[d] - 1) / binSize), parseInt((trends[d + 1] - 1) / binSize)]);
    for (let i = 0; i < binData.length; i++) {
      let [from, to] = binData[i];
      if (calculatedBinData[i][from] == undefined) {
        calculatedBinData[i][from] = {};
        for (let idx = 0; idx < 10; idx++) {
          calculatedBinData[i][from][idx] = 0;
        }
      }
      calculatedBinData[i][from][to] += 1;
    }
  }
  for (let j = 0; j < 7; j++) {
    Object.keys(calculatedBinData[j]).forEach(function (key) {
      let sum = Object.values(calculatedBinData[j][key]).reduce((acc, val) => acc + val)
      Object.keys(calculatedBinData[j][key]).forEach(function (d) { calculatedBinData[j][key][d] /= sum })
    });
  }
  return calculatedBinData;
}

function trendGraph(divId, data) {
  let svgHeight = 630;
  let svgWidth = 850;
  let svg = d3.select(`#${divId}`).append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

  let leftMargin = 30;
  let barHeight = 50;
  let barHorizontalGap = 100;
  let barWidth = 20;
  let barVerticalGap = 7;
  let yScale = d3.scaleLinear([0, barHeight]).domain([0, 1]);
  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 7; j++) {
      svg.append('rect').datum({ xIdx: j, yIdx: i })
        .attr("x", (d) => d.xIdx * (barWidth + barHorizontalGap) + leftMargin)
        .attr("y", (d) => d.yIdx * (barVerticalGap + barHeight))
        .attr("width", barWidth)
        .attr("height", barHeight)
        .attr("fill", "#4FAD7D")
        .on("mouseover", function () { highlightFlow(divId, `object_${j}_${i}`, true) })
        .on("mouseout", function () { highlightFlow(divId, `object_${j}_${i}`, false) });

      let prevY = 0;
      svg.append("g")
        .attr("id", `object_${j}_${i}`)
        .selectAll("path")
        .attr("class", `object_${j}_${i}`)
        .data(Object.values(data[j][i] || {}))
        .enter()
        .append("path")
        .attr("d", function (d, idx) {
          prevY += d;
          return `M${j * (barWidth + barHorizontalGap) + barWidth + leftMargin} ${i * (barVerticalGap + barHeight) + yScale(prevY - d)}
          L${(j + 1) * (barWidth + barHorizontalGap) + leftMargin} ${idx * (barVerticalGap + barHeight)}
          V ${idx * (barVerticalGap + barHeight) + barHeight}
          L${j * (barWidth + barHorizontalGap) + barWidth + leftMargin} ${i * (barVerticalGap + barHeight) + yScale(prevY)}`;
        })
        .attr("fill", "none");
    }
  }

  for (let i = 0; i < 10; i++) {
    svg.append("text")
      .attr("x", leftMargin - 20)
      .attr("y", i * (barVerticalGap + barHeight) + barHeight / 2)
      .text(i + 1);
  }

  for (let i = 0; i < 7; i++) {
    svg.append("text")
      .attr("x", leftMargin + i * (barWidth + barHorizontalGap) + 5)
      .attr("y", 10 * (barVerticalGap + barHeight) + 10)
      .text(i + 1)
      .attr("fill", "#623914");
  }
  svg.append("text")
    .attr("x", leftMargin + 3 * (barWidth + barHorizontalGap))
    .attr("y", 10 * (barVerticalGap + barHeight) + 25)
    .text("Trending Day")
    .attr("fill", "#623914");

  //legend
  let legendWidth = svgWidth - 50;
  let legendHeight = 30;
  let colorScale = d3.scaleSequential(d3.interpolateReds).domain([0, legendWidth]);
  d3.select(`#${divId}`).append("div").append("svg")
    .attr("width", legendWidth)
    .attr("height", legendHeight)
    .selectAll("rect")
    .data([...Array(legendWidth).keys()])
    .enter()
    .append("rect")
    .attr("x", (d) => d + leftMargin)
    .attr("y", (d) => 0)
    .attr("width", 1)
    .attr("height", legendHeight)
    .attr("fill", d => colorScale(d));
}

function highlightFlow(divId, groupId, highlight) {
  let colorScale = d3.scaleSequential(d3.interpolateReds).domain([0, 1]);
  let svg = d3.select(`#${divId}`).select("svg");
  svg.select(`#${groupId}`).selectAll("path")
    .attr("stroke", function (d) {
    })
    .attr("fill", d => highlight ? colorScale(d) : "none");
}


// Order [CA, IN, GB, US]
function createVis(data) {
  data = data.map(addRankToVideo);

  //Graph 1
  let allVideosCountByCategory = data.map(videosCountByCategory);
  let streamGraphData = formateDataForStreamGraph(allVideosCountByCategory);
  createStreamGraph(streamGraphDivId, streamGraphData);

  // Graph 2
  let channelTrendsCountByCountry = data.map(trendsByChannel);
  let top20ChannelTrendsByCountry = channelTrendsCountByCountry.map(sortObjectByValues);
  let top20ChannelTrends = sortObjectByValues(channelTrendsCountByCountry.reduce(mergeJSONObjects)).slice(0, 20);
  createBarGraph(barGraphDivId, top20ChannelTrends);

  // Graph 3
  let lineGraphData = buidDataForLineGraph(data);
  trendGraph(lineChartDivId, calculateBinData(lineGraphData[0]));
  window.changeTrendsCountry = function (selectObject) {
    let country = selectObject.value;
    d3.select(`#${lineChartDivId}`).select("svg").remove();
    d3.select(`#${lineChartDivId}`).select("svg").remove();
    trendGraph(lineChartDivId, calculateBinData(lineGraphData[country]));
  }
}

Promise.all([
  d3.csv(CAYoutubeDataLink),
  d3.csv(INYoutubeDataLink),
  d3.csv(GBYoutubeDataLink),
  d3.csv(USYoutubeDataLink)
]).then(createVis);