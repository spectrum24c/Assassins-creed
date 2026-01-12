document.addEventListener("DOMContentLoaded", () => {
    CustomEase.create("hop", "0.9, 0, 0.1, 1");
   
    const createSplit = (selector, type, className) => {
     return SplitText.create(selector, {
       type: type,
       [type + "Class"]: className,
       mask: type,
     });
    };
   
    const splitPreloaderHeader = createSplit(
       ".preloader-header a",
       "chars",
       "char"
    );
    const splitPreloaderCopy = createSplit(".preloader-copy p", "lines", "line");
   const splitHeader = createSplit(".header-row h1", "lines", "line");
   
   const chars = splitPreloaderHeader.chars;
   const lines = splitPreloaderCopy.lines;
   const headerLines = splitHeader.lines;
   
   const hIndex = chars.findIndex((char) => char.textContent === "A");
   const sIndex = chars.findIndex((char) => char.textContent === "C");
   
   const initialCharIndex = hIndex !== -1 ? hIndex : 0;
   const lastCharIndex = sIndex !== -1 ? sIndex : chars.length - 1;
   
   const initialChar = chars[initialCharIndex];
   const lastChar = chars[lastCharIndex];
   
   let HXOffset = -90;
   let SXOffset = -60;
   const MIX_COLOR = "#DC143C"; // color for "C"
   const A_COLOR = "#C7C8CA"; // set the color you want for "A" here
   // ...optionally set initial visible color for A if needed:
   if (chars && chars[initialCharIndex] && chars[initialCharIndex].style) {
     chars[initialCharIndex].style.color = "#FFFFFF";
   }
   
   chars.forEach((char, index) =>{
       gsap.set(char, { yPercent: index % 2 === 0 ? -100 : 200});
   });
   
   gsap.set(lines, { yPercent: 100 });
   gsap.set(headerLines, { yPercent: 100 });
   
   const preloaderImages = gsap.utils.toArray(".preloader-images .img");
   const preloaderImagesInner = gsap.utils.toArray(".preloader-images .img img");
   
   const t1 = gsap.timeline({delay:0.25});
   
   t1.to(".progress-bar", {
   scaleX: 1,
   duration: 4,
   ease: "power3.inOut"
   })
   .set(".progress-bar", { transformOrigin: "right"})
   .to(".progress-bar", {
   scaleX: 0,
   duration: 1,
   ease: "power3.in"
   });
   
   preloaderImages.forEach((preloaderImg, index) =>{
     t1.to(
       preloaderImg,
       {
         clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
         duration: 1,
         ease: "hop",
         delay: index * 0.75,
       },
       "-*5"
     );
   });
   
   preloaderImagesInner.forEach((preloaderImageInner, index) => {
     t1.to(
       preloaderImageInner,
       {
         scale: 1,
         duration: 1.5,
         ease: "hop",
         delay: index * 0.75,
       },
       "-*5.25"
     );
   });
   
   t1.to(
     lines,
     {
       yPercent: 0,
       duration: 2,
       ease: "hop",
       stagger: 0.1,
     },
     "-*5.5"
   );
   
   t1.to(
     chars,
     {
       yPercent: 0,
       duration: 1,
       ease: "hop",
       stagger: 0.025,
     },
     "-*5"
   );
   
   t1.to(
     ".preloader-images",
     {
       clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
       duration: 1,
       ease: "hop",
     },
     "-*1.5"
   );
   
   t1.to(
     lines,
     {
       y: "-125%",
       duration: 2,
       ease: "hop",
       stagger: 0.1,
     },
     "-*2"
   );
   
   t1.to(
     chars,
     {
       yPercent: (index) => {
         if (index === initialCharIndex || index === lastCharIndex) {
           return 0;
         }
         return index % 2 === 0 ? 100 : -100;
       },
       duration: 1,
       ease: "hop",
       stagger: 0.025,
       delay: 0.5,
       onStart: () => {
         // guard: if the target chars aren't present, skip the positioning/mix-blend steps
         if (!initialChar || !lastChar) return;
 
         const initialCharMask = initialChar.parentElement;
         const lastCharMask = lastChar.parentElement;
 
         if(
           initialCharMask &&
           initialCharMask.classList.contains("char-mask")
         ){
           initialCharMask.style.overflow = "visible";
         }
 
         if(
           lastCharMask &&
           lastCharMask.classList.contains("char-mask")
         ){
           lastCharMask.style.overflow = "visible";
         }
 
         const viewportWidth = window.innerWidth;
         const counterX = viewportWidth / 2;
         const initialCharRect = initialChar.getBoundingClientRect();
         const lastCharRect = lastChar.getBoundingClientRect();
 
         gsap.to([initialChar, lastChar], {
           duration: 1,
           ease: "hop",
           delay: 0.5,
           x: (i) => {
             const totalWidth = initialCharRect.width + lastCharRect.width;
             const leftStart = counterX - totalWidth / 2;
 
             if (i === 0) {
               return leftStart - initialCharRect.left + HXOffset;
             } else {
               const secondLeftTarget = leftStart + initialCharRect.width;
               return secondLeftTarget - lastCharRect.left + SXOffset;
             }
           },
           onComplete: () => {
             // apply blend only to header chars except the lastChar (C) and the initialChar (A)
             const charsExcept = chars.filter((c, i) => i !== lastCharIndex && i !== initialCharIndex);
             if (charsExcept.length) gsap.set(charsExcept, { mixBlendMode: "difference" });
             // set "C" to MIX_COLOR and keep normal blend
             if (lastChar && lastChar.style) {
               lastChar.style.color = MIX_COLOR;
               lastChar.style.mixBlendMode = "normal";
             }
             // set "A" to the specified A_COLOR when animation finishes
             if (initialChar && initialChar.style) {
               initialChar.style.color = A_COLOR;
               initialChar.style.mixBlendMode = "normal";
             }
             gsap.to(".preloader-header", {
               y: "0.5rem",
               scale: 0.35,
               duration: 1.75,
               ease: "hop",
             });
           },
         });
       },
     },
     "-*2.5"
   );
   
   t1.to(
     ".preloader",
     {
       clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
       duration: 1.755,
       ease: "hop",
     },
     "-*0.5"
   );

   // select the video (ensure it's muted initially) and play it when the timeline completes
   const heroVideo = document.getElementById('hero-video') || document.querySelector('.header-vid video');
   if (heroVideo) {
     // ensure it's muted so autoplay is allowed
     heroVideo.muted = true;
     heroVideo.playsInline = true;
     heroVideo.setAttribute('muted', '');

     // create overlay so user can click to unmute
     const container = heroVideo.parentElement || heroVideo;
     container.style.position = container.style.position || getComputedStyle(container).position === 'static' ? 'relative' : container.style.position;
     const overlay = document.createElement('div');
     overlay.className = 'video-unmute-overlay';
     overlay.textContent = 'Click to unmute';
     container.appendChild(overlay);

     function hideOverlay() { overlay.classList.add('hidden'); }
     function showOverlay() { overlay.classList.remove('hidden'); }

     function toggleMute() {
       if (heroVideo.muted) {
         heroVideo.muted = false;
         heroVideo.removeAttribute('muted');
         hideOverlay();
       } else {
         heroVideo.muted = true;
         heroVideo.setAttribute('muted', '');
         showOverlay();
       }
       // ensure playback after a user gesture
       if (heroVideo.paused) {
         heroVideo.play().catch(() => {});
       }
     }

     overlay.addEventListener('click', toggleMute);
     heroVideo.addEventListener('click', toggleMute);

     function tryPlay() {
       heroVideo.play().catch((err) => {
         // if autoplay fails show overlay so user can click to start
         console.warn('Video autoplay blocked or failed:', err);
         showOverlay();
       });
     }

     // Wait for preloader animation/transition to finish or for the preloader to be removed
     const preloader = document.querySelector('.preloader');
     if (preloader) {
       let fired = false;
       const done = () => {
         if (fired) return;
         fired = true;
         tryPlay();
         observer.disconnect();
         preloader.removeEventListener('animationend', onFinish);
         preloader.removeEventListener('transitionend', onFinish);
       };
       const onFinish = (e) => done();
       preloader.addEventListener('animationend', onFinish);
       preloader.addEventListener('transitionend', onFinish);

       // also observe removal or style changes
       const observer = new MutationObserver((mutations) => {
         for (const m of mutations) {
           if (m.type === 'childList' && !document.body.contains(preloader)) {
             done();
             return;
           }
           if (m.type === 'attributes') {
             const cs = getComputedStyle(preloader);
             if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) === 0) {
               done();
               return;
             }
           }
         }
       });
       observer.observe(document.body, { childList: true, subtree: true });
       observer.observe(preloader, { attributes: true, attributeFilter: ['style', 'class'] });
     } else {
       // fallback to load event
       window.addEventListener('load', () => setTimeout(tryPlay, 50));
     }
   }
   });
