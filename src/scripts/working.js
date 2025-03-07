document.addEventListener("wheel", (event) => {
    if (window.scrollY < window.innerHeight && event.deltaY > 0) {
        event.preventDefault();
        window.scrollTo({
        top: window.innerHeight,
        behavior: "smooth",
      });
    } else if (window.scrollY <= window.innerHeight && event.deltaY < 0) {
        event.preventDefault();
        window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }, { passive: false });