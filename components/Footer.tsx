export default function Footer() {
    return (
      <footer
        id="links"
        className="py-20 border-t border-white/10"
      >
        <div className="flex justify-center gap-8 text-white/60">
          <a
            href="https://open.spotify.com/artist/1IwiBlGpQaMr8dV7u5LtjI"
            target="_blank"
          >
            spotify
          </a>
  
          <a
            href="https://dystofuturemusic.bandcamp.com/"
            target="_blank"
          >
            bandcamp
          </a>
  
          <a
            href="https://linktr.ee/dystofuturemusic"
            target="_blank"
          >
            linktree
          </a>
  
          <a
            href="https://www.youtube.com/watch?v=AcfS40ARYEc"
            target="_blank"
          >
            youtube
          </a>
        </div>
  
        <p className="text-center text-white/30 mt-10 text-sm">
          AUREYX © 2026
        </p>
      </footer>
    );
  }