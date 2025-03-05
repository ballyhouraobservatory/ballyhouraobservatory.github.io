fetch('https://52-8.xyz/images/telemetry/weather-history.json')
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok: ' + response.status);
    }
    return response.json();
  })
  .then(data => {
    generateChart(filterAndBinWeatherData(data['history']));
  })
  .catch(error => {
    console.error('There was a problem fetching the JSON data:', error);
});

function filterAndBinWeatherData(readings, intervalMinutes = 10) {
  // Get the current time
  const now = new Date();
  
  // Calculate the timestamp for 24 hours ago
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  
  // Step 1: Filter to only include readings from the last 24 hours
  const recentReadings = readings.filter(reading => {
    const readingTime = new Date(reading.readingTimestamp);
    return readingTime >= twentyFourHoursAgo && readingTime <= now;
  });

  // Step 2: Group readings by 15-minute intervals
  const intervalBuckets = {};
  
  recentReadings.forEach(reading => {
    const readingTime = new Date(reading.readingTimestamp);
    
    // Calculate which 15-minute interval this reading belongs to
    const minutes = readingTime.getMinutes();
    const intervalNumber = Math.floor(minutes / intervalMinutes);
    const intervalMinuteStart = intervalNumber * intervalMinutes;
    
    // Create an interval key in format "YYYY-MM-DD HH:MM:00"
    const intervalKey = `${readingTime.getFullYear()}-${
      String(readingTime.getMonth() + 1).padStart(2, '0')}-${
      String(readingTime.getDate()).padStart(2, '0')} ${
      String(readingTime.getHours()).padStart(2, '0')}:${
      String(intervalMinuteStart).padStart(2, '0')}:00`;
    
    // Initialize the bucket if it doesn't exist
    if (!intervalBuckets[intervalKey]) {
      intervalBuckets[intervalKey] = {
        outsideTempSum: 0,
        skyTempSum: 0,
        rainAny: false,
        count: 0
      };
    }
    
    // Add the reading's data to the appropriate bucket
    intervalBuckets[intervalKey].outsideTempSum += reading.outsideTemp;
    intervalBuckets[intervalKey].skyTempSum += reading.skyTemp;
    intervalBuckets[intervalKey].rainAny = intervalBuckets[intervalKey].rainAny || reading.rain;
    intervalBuckets[intervalKey].count++;
  });
  
  // Step 3: Convert the buckets to the final array with averages
  const intervalData = Object.keys(intervalBuckets).sort().map(intervalKey => {
    const bucket = intervalBuckets[intervalKey];
    return {
      readingTimestamp: intervalKey,
      outsideTemp: parseFloat((bucket.outsideTempSum / bucket.count).toFixed(2)),
      skyTemp: parseFloat((bucket.skyTempSum / bucket.count).toFixed(2)),
      rain: bucket.rainAny,
      readingsCount: bucket.count,
      cloudCover: determineCloudCover(parseFloat((bucket.outsideTempSum / bucket.count).toFixed(2)), parseFloat((bucket.skyTempSum / bucket.count).toFixed(2)))
    };
  });
  return intervalData;
}







function determineCloudCover(outsideTemp, skyTemp) {
  // Calculate the temperature difference (always positive)
  const tempDiff = Math.abs(outsideTemp - skyTemp);
  
  // Base threshold that changes with the outside temperature
  // Lower temperatures typically have greater differences even on cloudy days
  let baseThreshold;
  
  if (outsideTemp <= 0) {
    // Very cold temperatures can have large differences even with clouds
    baseThreshold = 15;
  } else if (outsideTemp <= 10) {
    // Cold temperatures
    baseThreshold = 18;
  } else if (outsideTemp <= 20) {
    // Moderate temperatures
    baseThreshold = 20;
  } else {
    // Warm temperatures
    baseThreshold = 22;
  }
  
  // Calculate cloud coverage percentage (inverse relationship to temp difference)
  // When temp difference is 0, it's 100% cloudy
  // When temp difference is at or above threshold, it's 0% cloudy (clear)
  let cloudCoverPercent = 100 - (tempDiff / baseThreshold * 100);
  
  // Clamp between 0 and 100
  cloudCoverPercent = Math.max(0, Math.min(100, cloudCoverPercent));
  
  // Cloud cover categories
  let cloudCoverCategory;
  if (cloudCoverPercent < 10) {
    cloudCoverCategory = "Clear";
  } else if (cloudCoverPercent < 30) {
    cloudCoverCategory = "Mostly Clear";
  } else if (cloudCoverPercent < 60) {
    cloudCoverCategory = "Partly Cloudy";
  } else if (cloudCoverPercent < 90) {
    cloudCoverCategory = "Mostly Cloudy";
  } else {
    cloudCoverCategory = "Overcast";
  }
  
  return {
    cloudCoverPercent: Math.round(cloudCoverPercent),
    cloudCoverCategory,
    tempDiff: tempDiff.toFixed(1)
  };
}




// Get weather icon HTML based on conditions
function getWeatherIconHTML(outsideTemp, skyTemp, rain, hour) {
  if (rain) {
    return '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4299e1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 16.2A5 5 0 0 0 18 7h-1.26a8 8 0 1 0-11.62 9"></path><path d="M13 13v2m-6 4 1-1m5 0 1-1m-6-3 2-2"></path></svg>';
  }
  
  const tempDiff = outsideTemp - skyTemp;
  
  if (tempDiff > 8) {
    if (hour!=22) {
      return '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffb347" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path></svg>';
    } else {
      return '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e0e0e0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>';
    }
  }
  return '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#718096" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path></svg>';
}

function generateChart(weatherData) {

  // Format data for the chart
  const formattedData = weatherData.map(item => {
    const date = new Date(item.readingTimestamp);
    return {
      ...item,
      date,
      time: `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`,
      hour: date.getHours(),
      minute: date.getMinutes()
    };
  });

  // Calculate temperature range
  const minTemp = Math.min(
    Math.floor(Math.min(...formattedData.map(d => d.outsideTemp))),
    Math.floor(Math.min(...formattedData.map(d => d.skyTemp)))
  );
  
  const maxTemp = Math.max(
    Math.ceil(Math.max(...formattedData.map(d => d.outsideTemp))),
    Math.ceil(Math.max(...formattedData.map(d => d.skyTemp)))
  );

  // Set up the SVG dimensions
  const margin = {top: 20, right: 50, bottom: 30, left: 40};
  const width = document.getElementById('chart').clientWidth - margin.left - margin.right;
  const height = document.getElementById('chart').clientHeight - margin.top - margin.bottom;

  // Create SVG element
  const svg = d3.select('#chart')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // Create scales
  const x = d3.scaleTime()
    .domain(d3.extent(formattedData, d => d.date))
    .range([0, width]);

  const y = d3.scaleLinear()
    .domain([minTemp - 1, maxTemp + 1])
    .range([height, 0]);

  // Add the X grid lines
  svg.append('g')
    .attr('class', 'grid')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x)
      .ticks(5)
      .tickSize(-height)
      .tickFormat('')
    );

  // Add the Y grid lines
  svg.append('g')
    .attr('class', 'grid')
    .call(d3.axisLeft(y)
      .ticks(5)
      .tickSize(-width)
      .tickFormat('')
    );

  // Add X axis
  svg.append('g')
    .attr('class', 'axis')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x).ticks(5).tickFormat(d3.timeFormat('%H:%M')));

  // Add Y axis
  svg.append('g')
    .attr('class', 'axis')
    .call(d3.axisLeft(y).ticks(6));

  // Create tooltip
  const tooltip = d3.select('body').append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0);

  // Add rain bars
  const barWidth = width / formattedData.length * 0.8; // 80% of available space per data point
  
  svg.selectAll('.rain-bar')
    .data(formattedData)
    .enter()
    .append('rect')
    .attr('class', 'rain-bar')
    .attr('x', d => x(d.date) - barWidth/2)
    .attr('width', barWidth)
    .attr('y', d => d.rain ? 0 : height) // If rain is true, start from top, otherwise position at bottom (invisible)
    .attr('height', d => d.rain ? height * 0.15 : 0) // 15% of chart height for rain bars
    .attr('opacity', d => d.rain ? 0.7 : 0);

  // Create line generator
  const line = d3.line()
    .x(d => x(d.date))
    .y(d => y(d.outsideTemp))
    .curve(d3.curveMonotoneX);

  // Create line generator for sky temperature
  const skyLine = d3.line()
    .x(d => x(d.date))
    .y(d => y(d.skyTemp))
    .curve(d3.curveMonotoneX);

  // Add the Ambient Temperature line
  svg.append('path')
    .datum(formattedData)
    .attr('class', 'line outside-temp')
    .attr('d', line);

  // Add the sky temperature line
  svg.append('path')
    .datum(formattedData)
    .attr('class', 'line sky-temp')
    .attr('d', skyLine);

  // Add invisible overlay for tooltip
  svg.append('rect')
    .attr('width', width)
    .attr('height', height)
    .style('fill', 'none')
    .style('pointer-events', 'all')
    .on('mousemove', function(event) {
      const [mouseX] = d3.pointer(event);
      const x0 = x.invert(mouseX);
      
      // Find the closest data point
      const bisect = d3.bisector(d => d.date).left;
      const i = bisect(formattedData, x0, 1);
      const d0 = formattedData[i - 1];
      const d1 = formattedData[i];
      const d = x0 - d0.date > d1.date - x0 ? d1 : d0;
      
      // Show tooltip
      tooltip.transition()
        .duration(200)
        .style('opacity', 0.9);
      
      tooltip.html(`
        <strong>Time: ${d.time}</strong><br/>
        Ambient Temp: ${d.outsideTemp.toFixed(1)}°C<br/>
        Sky Temp: ${d.skyTemp.toFixed(1)}°C<br/>
        Cloud cover: ${d.cloudCover.cloudCoverPercent}%<br/>
        ${d.rain ? '<strong style="color: #4299e1;">Rain</strong>' : 'No Rain'}
      `)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 28) + 'px');
    })
    .on('mouseout', function() {
      tooltip.transition()
        .duration(500)
        .style('opacity', 0);
    });

  // Add weather icons
//   formattedData.forEach((d, i) => {
//     if (i % 6 === 0) { // Display every 6 hours
//       let icon;
      
//       if (d.weather === 0) {
//         // Sunny
//         icon = d.isDay ? "☀️" : "🌙";
//       } else if (d.weather === 1) {
//         // Partly cloudy
//         icon = d.isDay ? "🌤️" : "☁️";
//       } else if (d.weather === 2) {
//         // Cloudy
//         icon = "☁️";
//       } else {
//         // Rainy
//         icon = "🌧️";
//       }
      
//       svg.append("text")
//         .attr("class", "weather-icon")
//         .attr("x", x(i))
//         .attr("y", yTemp(d.temp) - 15)
//         .attr("text-anchor", "middle")
//         .text(icon);
//     }
//   });

  // Create forecast items
  const forecastHours = [4, 10, 18, 22];
  const forecastContainer = document.getElementById('forecast');
  
  forecastHours.forEach(hour => {
    // Find data point closest to this hour
    const hourData = formattedData.find(d => d.hour === hour) || formattedData[0];
    
    const forecastItem = document.createElement('div');
    forecastItem.className = 'forecast-item';
    forecastItem.innerHTML = `
      <div class="forecast-hour">${hour}:00</div>
      <div class="forecast-icon">${getWeatherIconHTML(hourData.outsideTemp, hourData.skyTemp, hourData.rain, hour)}</div>
      <div class="forecast-temp">${hourData.outsideTemp.toFixed(1)}°C</div>
      ${hourData.rain ? '<div class="forecast-rain">Rain</div>' : ''}
    `;
    
    forecastContainer.appendChild(forecastItem);
  });

  // Add min/max
  document.getElementById('minmax').innerHTML = `
    <div>Min: ${minTemp}°C</div>
    <div>Max: ${maxTemp}°C</div>
  `;
}

// Handle window resize
window.addEventListener('resize', function() {
  const chartContainer = document.getElementById('chart');
  chartContainer.innerHTML = '';
  
  const width = chartContainer.clientWidth - margin.left - margin.right;
  const height = chartContainer.clientHeight - margin.top - margin.bottom;

  const svg = d3.select('#chart')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  const x = d3.scaleTime()
    .domain(d3.extent(formattedData, d => d.date))
    .range([0, width]);

  const y = d3.scaleLinear()
    .domain([minTemp - 1, maxTemp + 1])
    .range([height, 0]);

  svg.append('g')
    .attr('class', 'grid')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x)
      .ticks(5)
      .tickSize(-height)
      .tickFormat('')
    );

  svg.append('g')
    .attr('class', 'grid')
    .call(d3.axisLeft(y)
      .ticks(5)
      .tickSize(-width)
      .tickFormat('')
    );

  svg.append('g')
    .attr('class', 'axis')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x).ticks(5).tickFormat(d3.timeFormat('%H:%M')));

  svg.append('g')
    .attr('class', 'axis')
    .call(d3.axisLeft(y).ticks(6));

  // Add rain bars on resize
  const barWidth = width / formattedData.length * 0.8;
  
  svg.selectAll('.rain-bar')
    .data(formattedData)
    .enter()
    .append('rect')
    .attr('class', 'rain-bar')
    .attr('x', d => x(d.date) - barWidth/2)
    .attr('width', barWidth)
    .attr('y', d => d.rain ? 0 : height)
    .attr('height', d => d.rain ? height * 0.15 : 0)
    .attr('opacity', d => d.rain ? 0.7 : 0);

  const line = d3.line()
    .x(d => x(d.date))
    .y(d => y(d.outsideTemp))
    .curve(d3.curveMonotoneX);

  const skyLine = d3.line()
    .x(d => x(d.date))
    .y(d => y(d.skyTemp))
    .curve(d3.curveMonotoneX);

  svg.append('path')
    .datum(formattedData)
    .attr('class', 'line outside-temp')
    .attr('d', line);

  svg.append('path')
    .datum(formattedData)
    .attr('class', 'line sky-temp')
    .attr('d', skyLine);

  svg.append('rect')
    .attr('width', width)
    .attr('height', height)
    .style('fill', 'none')
    .style('pointer-events', 'all')
    .on('mousemove', function(event) {
      const [mouseX] = d3.pointer(event);
      const x0 = x.invert(mouseX);
      
      const bisect = d3.bisector(d => d.date).left;
      const i = bisect(formattedData, x0, 1);
      const d0 = formattedData[i - 1];
      const d1 = formattedData[i];
      const d = x0 - d0.date > d1.date - x0 ? d1 : d0;
      
      tooltip.transition()
        .duration(200)
        .style('opacity', 0.9);
      
      tooltip.html(`
        <strong>Time: ${d.time}</strong><br/>
        Ambient Temp: ${d.outsideTemp.toFixed(1)}°C<br/>
        Sky Temp: ${d.skyTemp.toFixed(1)}°C<br/>
        ${d.rain ? '<strong style="color: #4299e1;">Rain</strong>' : 'No Rain'}
      `)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 28) + 'px');
    })
    .on('mouseout', function() {
      tooltip.transition()
        .duration(500)
        .style('opacity', 0);
    });
});
