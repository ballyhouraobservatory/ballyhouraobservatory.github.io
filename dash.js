fetch('https://pub-6cfbb3c67a0e4e35901c0084d6cd8da4.r2.dev/weather-history.json')
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

function isDaytime(date) {
  const latitude = 52.2 * Math.PI / 180;
  const longitude = -8.4;
  const dayOfYear = d3.timeDay.count(d3.timeYear(date), date) + 1;
  const hour = date.getHours() + date.getMinutes() / 60;
  const yearAngle = 2 * Math.PI / 365 * (dayOfYear - 1 + (hour - 12) / 24);
  const equationOfTime = 229.18 * (
    0.000075 +
    0.001868 * Math.cos(yearAngle) -
    0.032077 * Math.sin(yearAngle) -
    0.014615 * Math.cos(2 * yearAngle) -
    0.040849 * Math.sin(2 * yearAngle)
  );
  const solarDeclination =
    0.006918 -
    0.399912 * Math.cos(yearAngle) +
    0.070257 * Math.sin(yearAngle) -
    0.006758 * Math.cos(2 * yearAngle) +
    0.000907 * Math.sin(2 * yearAngle) -
    0.002697 * Math.cos(3 * yearAngle) +
    0.00148 * Math.sin(3 * yearAngle);
  const timezone = -date.getTimezoneOffset() / 60;
  const solarMinutes = hour * 60 + equationOfTime + 4 * longitude - 60 * timezone;
  const hourAngle = (solarMinutes / 4 - 180) * Math.PI / 180;
  const solarElevation = Math.asin(
    Math.sin(latitude) * Math.sin(solarDeclination) +
    Math.cos(latitude) * Math.cos(solarDeclination) * Math.cos(hourAngle)
  );

  return solarElevation > -0.833 * Math.PI / 180;
}

function appendWeatherIcon(selection, weather) {
  const cloudCover = weather.cloudCover.cloudCoverPercent;
  let type;
  if (weather.rain) {
    type = 'rain';
  } else if (cloudCover === 0) {
    type = isDaytime(weather.date) ? 'clear-day' : 'clear-night';
  } else if (cloudCover >= 60) {
    type = 'cloud';
  } else {
    type = 'partly-cloudy';
  }

  selection.append('title').text(
    type === 'rain' ? 'Cloud and rain' :
    type === 'cloud' ? 'Cloudy' :
    type === 'partly-cloudy' ? 'Partly cloudy' :
    type === 'clear-day' ? 'Clear' : 'Clear night'
  );

  const showSun = type === 'clear-day' || (type === 'partly-cloudy' && isDaytime(weather.date));
  const showMoon = type === 'clear-night' || (type === 'partly-cloudy' && !isDaytime(weather.date));

  if (showSun) {
    const sun = selection.append('g')
      .attr('fill', 'none')
      .attr('stroke', '#e9a72e')
      .attr('stroke-width', 1.6)
      .attr('stroke-linecap', 'round');
    sun.append('circle')
      .attr('cx', 9)
      .attr('cy', 10)
      .attr('r', 4)
      .attr('fill', '#ffd166')
      .attr('stroke', '#e9a72e');
    sun.append('path')
      .attr('d', 'M9 2v2 M9 16v2 M1 10h2 M15 10h2 M3.3 4.3l1.4 1.4 M13.3 14.3l1.4 1.4 M14.7 4.3l-1.4 1.4 M4.7 14.3l-1.4 1.4');
  }

  if (showMoon) {
    selection.append('path')
      .attr('d', 'M19 16.2A8 8 0 0 1 8.8 5a8.2 8.2 0 1 0 10.2 11.2Z')
      .attr('fill', '#8c9aa5');
  }

  if (type !== 'clear-day' && type !== 'clear-night') {
    selection.append('path')
      .attr('d', 'M20 18.5H7a4 4 0 0 1-.5-8A7 7 0 0 1 20 11a3.75 3.75 0 0 1 0 7.5Z')
      .attr('fill', '#d5d9dc')
      .attr('stroke', '#879198')
      .attr('stroke-width', 1.2)
      .attr('stroke-linejoin', 'round');
  }

  if (type === 'rain') {
    selection.append('path')
      .attr('d', 'M9 21l-1 2 M15 21l-1 2 M21 21l-1 2')
      .attr('fill', 'none')
      .attr('stroke', '#2585d0')
      .attr('stroke-width', 1.7)
      .attr('stroke-linecap', 'round');
  }
}

function generateChart(weatherData) {
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

  const minTemp = Math.min(
    Math.floor(Math.min(...formattedData.map(d => d.outsideTemp))),
    Math.floor(Math.min(...formattedData.map(d => d.skyTemp)))
  );
  
  const maxTemp = Math.max(
    Math.ceil(Math.max(...formattedData.map(d => d.outsideTemp))),
    Math.ceil(Math.max(...formattedData.map(d => d.skyTemp)))
  );

  const chartContainer = document.getElementById('chart');
  const tooltip = d3.select('body').append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0);

  function drawChart() {
    const margin = {top: 48, right: 20, bottom: 24, left: 48};
    const width = chartContainer.clientWidth - margin.left - margin.right;
    const height = chartContainer.clientHeight - margin.top - margin.bottom;
    if (width <= 0 || height <= 0) return;

    d3.select(chartContainer).selectAll('*').remove();

    const svg = d3.select(chartContainer)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const [start, end] = d3.extent(formattedData, d => d.date);
    const x = d3.scaleTime()
      .domain([start, end])
      .range([0, width]);

    let yMin = Math.min(0, Math.floor(minTemp / 2) * 2);
    let yMax = Math.max(0, Math.ceil(maxTemp / 2) * 2) + 4;
    if (yMin === yMax) {
      yMin -= 2;
      yMax += 2;
    }

    const y = d3.scaleLinear()
      .domain([yMin, yMax])
      .range([height, 0]);
    const yTicks = d3.range(yMin, yMax + 1, 2);
    const hourTicks = d3.timeHour.range(
      d3.timeHour.ceil(start),
      d3.timeHour.offset(d3.timeHour.floor(end), 1)
    );
    const labelEveryHours = width < 500 ? 4 : 2;
    const hourLabels = hourTicks.filter(date => date.getHours() % labelEveryHours === 0);

    svg.append('g')
      .attr('class', 'grid hour-grid')
      .call(d3.axisTop(x)
        .tickValues(hourTicks)
        .tickSize(-height)
        .tickFormat('')
      );

    const yGrid = svg.append('g')
      .attr('class', 'grid y-grid')
      .call(d3.axisLeft(y)
        .tickValues(yTicks)
        .tickSize(-width)
        .tickFormat('')
      );
    yGrid.selectAll('.tick').filter(value => value === 0).classed('zero-grid', true);

    svg.append('g')
      .attr('class', 'axis time-axis')
      .call(d3.axisTop(x)
        .tickValues(hourLabels)
        .tickSize(0)
        .tickFormat(d3.timeFormat('%H'))
      );

    svg.append('g')
      .attr('class', 'axis temperature-axis')
      .call(d3.axisLeft(y)
        .tickValues(yTicks)
        .tickFormat(value => `${value}°`)
      );

    const midnightTicks = d3.timeDay.range(
      d3.timeDay.ceil(start),
      d3.timeDay.offset(d3.timeDay.floor(end), 1)
    );
    svg.selectAll('.day-label')
      .data(midnightTicks)
      .enter()
      .append('text')
      .attr('class', 'day-label')
      .attr('x', date => x(date) + (x(date) < 72 ? 4 : 0))
      .attr('y', -28)
      .attr('text-anchor', date => {
        const position = x(date);
        return position < 72 ? 'start' : position > width - 72 ? 'end' : 'middle';
      })
      .text(d3.timeFormat('%a. %d %b'));

    const barWidth = width / formattedData.length * 1.6;
    const barHeight = 32;
    svg.selectAll('.rain-bar')
      .data(formattedData.filter(d => d.rain))
      .enter()
      .append('rect')
      .attr('class', 'rain-bar')
      .attr('x', d => x(d.date) - barWidth / 2)
      .attr('y', y(0) - barHeight)
      .attr('width', barWidth)
      .attr('height', barHeight);

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

    const twoHourTicks = hourTicks.filter(date => date.getHours() % 2 === 0);
    const bisect = d3.bisector(d => d.date).left;
    svg.selectAll('.weather-icon')
      .data(twoHourTicks.map(date => {
        const index = bisect(formattedData, date, 1);
        const before = formattedData[index - 1];
        const after = formattedData[index];
        const nearest = !after || date - before.date <= after.date - date ? before : after;
        const windowStart = date.getTime() - 60 * 60 * 1000;
        const windowEnd = date.getTime() + 60 * 60 * 1000;
        const windowReadings = formattedData.filter(
          reading => reading.date.getTime() >= windowStart && reading.date.getTime() < windowEnd
        );
        const readings = windowReadings.length ? windowReadings : [nearest];
        const averageCloudCover = d3.mean(
          readings,
          reading => reading.cloudCover.cloudCoverPercent
        );
        const weather = {
          ...nearest,
          date,
          rain: readings.some(reading => reading.rain),
          cloudCover: {
            ...nearest.cloudCover,
            cloudCoverPercent: averageCloudCover
          }
        };
        return {date, weather};
      }))
      .enter()
      .append('g')
      .attr('class', 'weather-icon')
      .attr('transform', d => `translate(${x(d.date) - 12},${y(d.weather.outsideTemp) - 31})`)
      .each(function(d) {
        appendWeatherIcon(d3.select(this), d.weather);
      });

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
        const d = !d1 || x0 - d0.date <= d1.date - x0 ? d0 : d1;

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
  }

  drawChart();
  window.addEventListener('resize', drawChart);

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
