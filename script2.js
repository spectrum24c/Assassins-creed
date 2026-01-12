document.addEventListener("DOMContentLoaded", () => {
	// Register GSAP plugins (was missing)
	gsap.registerPlugin(ScrollTrigger, SplitText);

	const lenis = new Lenis();

	// Synchronize Lenis scrolling with GSAP's ScrollTrigger plugin
	lenis.on('scroll', ScrollTrigger.update);

	// Add Lenis's requestAnimationFrame (raf) method to GSAP's ticker
	// This ensures Lenis's smooth scroll animation updates on each GSAP tick
	gsap.ticker.add((time) => {
	  lenis.raf(time * 1000); // Convert time from seconds to milliseconds
	});

	// Disable lag smoothing in GSAP to prevent any delay in scroll animations
	gsap.ticker.lagSmoothing(0);

	// fixed selectors (removed trailing spaces) and null checks
	const spotlightImages = document.querySelector(".spotlight-images");
	const maskContainer = document.querySelector(".mask-container");
	const maskImage = document.querySelector(".mask-img");
	const maskHeader = document.querySelector(".mask-container .header h1");

	// guard against missing element to avoid crashes
	const spotlightContainerHeight = spotlightImages ? spotlightImages.offsetHeight : 0;
	const viewportHeight = window.innerHeight;
	const initialOffset = spotlightContainerHeight * 0.05;
	const totalMovement = spotlightContainerHeight + initialOffset + viewportHeight;

	let headerSplit = null;
	if (maskHeader && typeof SplitText !== "undefined") {
		// correct SplitText usage
		headerSplit = new SplitText(maskHeader, { type: "words", wordsClass: "spotlight-word" });
		gsap.set(headerSplit.words, { opacity: 0 });
	}

	// only create the ScrollTrigger when the required element exists
	if (spotlightImages && spotlightContainerHeight > 0) {
		ScrollTrigger.create({
			trigger: ".spotlight",
			start: "top top",
			end: `+=${window.innerHeight * 7}px`,
			pin: true,
			pinSpacing: true,
			scrub: 1,
			onUpdate: (self) => {
				const progress = self.progress;
				if (progress < 0.5) {
					const imageMoveProgress = progress / 0.5;

					const startY = 5;
					const endY = -(totalMovement / spotlightContainerHeight) * 100;
					const currentY = startY + (endY - startY) * imageMoveProgress;

					gsap.set(spotlightImages, { y: `${currentY}%` });
				}

				if (maskContainer && maskImage) {
					if (progress > 0.25 && progress < 0.75) {
						const maskProgress = (progress - 0.25) / 0.5;
						const maskSize = `${maskProgress * 450}%`;
						const imageScale = 1.5 - maskProgress * 0.5;

						maskContainer.style.setProperty("-webkit-mask-size", maskSize);
						maskContainer.style.setProperty("mask-size", maskSize);

						gsap.set(maskImage, { scale: imageScale });
					} else if (progress < 0.25) {
						maskContainer.style.setProperty("-webkit-mask-size", "0%");
						maskContainer.style.setProperty("mask-size", "0%");
						gsap.set(maskImage, { scale: 1.5 });
					} else if (progress > 0.75) {
						maskContainer.style.setProperty("-webkit-mask-size", "450%");
						maskContainer.style.setProperty("mask-size", "450%");
						gsap.set(maskImage, { scale: 1 });
					}
				}
                if (headerSplit && headerSplit.words.length > 0) {
                    if (progress > 0.75 && progress <= 0.95){
                        const textProgress = (progress - 0.75) / 0.2;
                        const totalWords = headerSplit.words.length;

                        headerSplit.words.forEach((word, index) => {
                            const wordRevealProgress = index / totalWords;

                            if (textProgress >= wordRevealProgress) {
                                gsap.set(word, { opacity: 1});
                            } else { gsap.set(word, { opacity: 0})
                        }
                        })
                    } else if (progress <= 0.75) {
                        gsap.set(headerSplit.words, { opacity: 0 });
                    } else if (progress > 0.95) {
                        gsap.set(headerSplit.words, { opacity: 1 });
                    }
                }
			}
		});
	}
});