---
layout: page
title: Data
permalink: /data
comments: true
---
## SQM and weather data

All Sky quality and weather data can be [downloaded from here](https://github.com/dokeeffe/bh-observatory-data/tree/master/datasets)

## Fits File Data

All fits image data grouped by object taken by the observatory is below. 
All images are calibrated (flat, dark & bias) and plate solved.
Image quality can vary, some have focus and tracking problems.

{% for fits in site.data.fits_data_extract %}
### {{ fits.name }} 
[Download all {{ fits.filecount }} files]({{ fits.link }})

<img src="/images/fits-thumbnails/{{ fits.files[-1].thumbnail }}"/>

---

{% endfor %}
