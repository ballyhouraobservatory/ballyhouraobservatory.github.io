---
layout: post
title:  "How cloudy skies compare to clear skies in rural North Cork"
excerpt: Using kernel density estimation to analyse sky quality data
published: true
images:

---

In April 2019 I took part in an ongoing light pollution survey by Cork Astronomy Club. A **data-logging SQM** (SQM-DL) was installed at the observatory for a few weeks. Since the observatory is also continuously logging weather conditions using a [home-made cloud and rain monitor](https://github.com/dokeeffe/cloud-rain-monitor), it could be interesting to see how these to data sets could be combined and see what could be learned. This article describes using the [Seaborn](https://seaborn.pydata.org/) statistical plotting library to explore this data.


**Rural north Cork** sits midway between the two cities of Limerick and Cork. There is a lot of local variation in sky quality but at the observatory, it is generally [Bortle](https://en.wikipedia.org/wiki/Bortle_scale) 3 (rural sky) on clear dry nights and getting close to 4 (Rural/suburban transition) on humid clear nights. 

![]({{ site.baseurl }}/images/sqm-weather/VIIRS2019.png)

At a true dark-sky location, the night sky is darker during cloudy nights than clear nights. Even low levels of light pollution can swap this around, making the cloudy night sky brighter than a clear sky. Since the data logging SQM was capturing data for **both clear and cloudy nights**, generating a distribution plot of the entire dataset should show how clear skies differ from cloudy skies.
Plotting all the SQM-DL data in a [seaborn dist plot](https://seaborn.pydata.org/examples/distplot_options.html) shows this split between clear and cloudy nights as two peaks. **Cloudy skies at ~20.2** and **clear skies at ~21.6**. A gap of 1.4 MPSAS. 

![]({{ site.baseurl }}/images/sqm-weather/msas-kde.png)

**Now let's take a look at the weather**. The weather station collects sky temperature readings every minute using a [Melexis MLX90614](https://www.melexis.com/en/product/MLX90614/Digital-Plug-Play-Infrared-Thermometer-TO-Can) IR sensor. This is used by the observatory to monitor for clouds since the difference between ambient temperature and sky-temperature can be used to give a good indication of sky clarity. The bigger the difference, the clearer the sky. Plotting this temperature-delta for weather station data results in a similar double peak distribution plot. Clear skies having a usual temp-delta of about -23 degrees and cloudy skies having a usual temp-delta of about -5 degrees.

![]({{ site.baseurl }}/images/sqm-weather/skytemp-kde.png)

**Combining** these two dimensions into a join kernel density estimate plot shows how they are related. Two clear distributions can be seen. The larger variance in the cloudy skies data is probably due to variations in cloud height, rain and fog.

![]({{ site.baseurl }}/images/sqm-weather/2dkde.png)


**Conclusions** The difference in brightness between clear and cloudy skies could be used to quantify changes in light pollution over time. Hopefully, we will get another chance to borrow the SQM-DL in future and have another look at the night skies of North Cork when all street lights have eventually been retrofitted to LEDs.

All data for the above plots can be downloaded from [here](https://github.com/dokeeffe/bh-observatory-data/tree/master/datasets)
