---
layout: post
title:  "One year with a Samyang 135mm F2 lens"
excerpt: A long term review of widefield imaging using a Samyang 135mm lens & DSLR
published: true
images:
  - url: /images/135mm/SH157-annotated.png

---
<style>
* {box-sizing: border-box;}

.img-zoom-container {
  position: relative;
}

.img-zoom-lens {
  position: absolute;
  border: 1px solid #d4d4d4;
  /*set the size of the lens:*/
  width: 60px;
  height: 60px;
}

.img-zoom-result {
  border: 1px solid #d4d4d4;
  /*set the size of the result div:*/
  width: 350px;
  height: 350px;
}
</style>
<script>
function imageZoom(imgID, resultID) {
  var img, lens, result, cx, cy;
  img = document.getElementById(imgID);
  result = document.getElementById(resultID);
  lens = document.createElement("DIV");
  lens.setAttribute("class", "img-zoom-lens");
  img.parentElement.insertBefore(lens, img);
  cx = result.offsetWidth / lens.offsetWidth;
  cy = result.offsetHeight / lens.offsetHeight;
  result.style.backgroundImage = "url('" + img.src + "')";
  result.style.backgroundSize = (img.width * cx) + "px " + (img.height * cy) + "px";
  lens.addEventListener("mousemove", moveLens);
  img.addEventListener("mousemove", moveLens);
  lens.addEventListener("touchmove", moveLens);
  img.addEventListener("touchmove", moveLens);
  function moveLens(e) {
    var pos, x, y;
    e.preventDefault();
    pos = getCursorPos(e);
    x = pos.x - (lens.offsetWidth / 2);
    y = pos.y - (lens.offsetHeight / 2);
    if (x > img.width - lens.offsetWidth) {x = img.width - lens.offsetWidth;}
    if (x < 0) {x = 0;}
    if (y > img.height - lens.offsetHeight) {y = img.height - lens.offsetHeight;}
    if (y < 0) {y = 0;}
    lens.style.left = x + "px";
    lens.style.top = y + "px";
    result.style.backgroundPosition = "-" + (x * cx) + "px -" + (y * cy) + "px";
  }
  function getCursorPos(e) {
    var a, x = 0, y = 0;
    e = e || window.event;
    a = img.getBoundingClientRect();
    x = e.pageX - a.left;
    y = e.pageY - a.top;
    x = x - window.pageXOffset;
    y = y - window.pageYOffset;
    return {x : x, y : y};
  }
}
</script>
About 1 year ago, in October 2021 I purchased a second hand Samyang 135mm F2 lens from <a href="https://www.mpb.com/">MBP</a>. In this post, I'll describe how I've used it over the last 12 months. 

The lens was advertised in excellent condition and arrived as-new in its original packaging. The lens is the cine-lens variation which is the exact same as the usual F2 product but with T stop markings and toothed rings. The toothed rings were ideal for attaching a **<a href="https://github.com/dokeeffe/cine-moonlite" target="_blank">home made moonlite-clone focuser</a>** with a very, very home made wooden bracket. See below.

![]({{ site.baseurl }}/images/135mm/IMG_4270.JPG)

# Setting up

The DSLR camera, lens and focuser was mounted piggyback on the same CEM120 mount as the C11 scope. This allowed unguided exposures of several minutes but meant the C11 could not be used at the same time. A small dew heater strip around the front of the lens prevented dew. A USB dummy battery allowed powering the camera from a spare USB port on the mount's saddle. Sky conditions are usually around SQM 21.0 - 21.5, bortle class 4. INDI and KSTARS controlled the camera and focuser with no problems and the entire setup is used remotely.

![]({{ site.baseurl }}/images/135mm/piggyback.JPG)

# First light and first impressions

First light was M31. 52x1min exposures at F2, stacked in <a href="https://siril.org/" target="_blank">Siril</a>. The lens is razor sharp at F2. Almost no chromatic aberration or edge of field distortion. Some slight coma like distortion is visible in the lower left corner. **<a href="/images/135mm/FULL-M31-52min-135mm-F2.jpg" target="_blank">Click here for a full size version</a>** or hover your mouse over the image below.
<div class="img-zoom-container">
  <img id="m31" src="/images/135mm/FULL-M31-52min-135mm-F2.jpg" width="1030" height="687">
  <div id="m31result" class="img-zoom-result"></div>
</div>

Another image of M45. **<a href="/images/135mm/FULL-M45_57minF2.jpg" target="_blank">Click here for a full size version</a>** 57x1min exposures at F2. Stacked in <a href="https://siril.org/" target="_blank">Siril</a>.

<div class="img-zoom-container">
  <img id="m45" src="/images/135mm/FULL-M45_57minF2.jpg" width="1030" height="687">
  <div id="m45result" class="img-zoom-result"></div>
</div>


# Improved red sensitivity and modifying the DSLR

In the winter I removed the camera's built in IR filter and replaced it with a Baader BCF 1 DSLR Astro Conversion Filter. This made a big difference in the sensitivity of red light from ionized hydrogen (Hα). 

<img src="/images/135mm/modifyit.jpg"/>

Another image of the Orion belt region below taken after modification in Feb 2022. **<a href="/images/135mm/Orion-100x-60sec.jpg" target="_blank">Click here for a full size version</a>** 100x1min exposures at F2. Stacked in <a href="https://siril.org/" target="_blank">Siril</a>.

<div class="img-zoom-container">
  <img id="m42" src="/images/135mm/Orion-100x-60sec.jpg" width="1030" height="687">
  <div id="m42result" class="img-zoom-result"></div>
</div>

## Adding an Optolong l-enhance filter and exploring Cassiopeia

The late summer / early autumn skies are full of red ionized Hα regions. I added a clip in Optolong l-enhance filter to try to highlight these regions in images. The l-enhance has a fairly narrow band-pass for Hα at 656nm. This can cause problems for fast optical systems where the light passes through the filter's coatings at an oblique angle, effectively passing through a 'thicker' layer of the interference coating. When this happens, transmission of light is reduced. To reduce this effect, I stopped the lens down from F2 to F2.8. 

The image below of the double-cluster and the heart & soul nebula is 52x3min (total over 2.5 hours) exposure. Stopping the lens down also improved the sharpness of the bottom left corner.

<div class="img-zoom-container">
  <img id="hns" src="/images/135mm/HNS-52x3min-135mmF2.jpg" width="1030" height="687">
  <div id="hnsresult" class="img-zoom-result"></div>
</div>

# The Cassiopeia Cepheus region.

Late September 2022 brought this region high into the sky. There is so many red Hα nebula, dark nebulae and clusters in this region, its easy to get lost. I just framed the image below to capture as much as I could in one frame.

![]({{ site.baseurl }}/images/135mm/cas-ceph-map.png)

The image is 60x3min exposures at F2.8 again using the l-enhance filter. **<a href="/images/135mm/SH157-60x3min-135mmF2.8-l-enhance-process2.jpg" target="_blank">Click here for a full size version</a>**

![]({{ site.baseurl }}/images/135mm/SH157-60x3min-135mmF2.8-l-enhance-process2.jpg)

The annotated version below shows many obscure nebulae from the <a href="https://en.wikipedia.org/wiki/Sharpless_catalog" target="_blank">sharpless catalog</a> labeled with Sh2-xxx as well as many even more obscure dark nebulae from the LDN - Lynds Catalog of Dark Nebulae.

![]({{ site.baseurl }}/images/135mm/SH157-annotated.png)

# Conclusion

In my opinion this lens is amazing value for money. I've never used an APO refractor but some of the images seem to rival those from a decent small APO at a fraction of the cost. Taking images at F2 is also a lot of fun. The only disadvantage for me is not being able to use the C11 to do photometry at the same time. Another mount would solve this problem.


<script>
// Initiate zoom effect:
imageZoom("m31", "m31result");
imageZoom("m45", "m45result");
imageZoom("m42", "m42result");
imageZoom("hns", "hnsresult");
</script>
