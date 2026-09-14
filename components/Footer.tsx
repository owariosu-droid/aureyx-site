export default function Footer() {
    return (
        <footer
          id="links"
          style={{ marginTop: "48px", padding: "32px 24px" }}
          className="border-t border-white/10"
      >
        <div
          style={{
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: "24px 48px",
      }}
          className="text-white/60"
>
          <a
            href="https://open.spotify.com/artist/1IwiBlGpQaMr8dV7u5LtjI"
            target="_blank"
          >
            Spotify
          </a>
  
          <a
            href="https://dystofuturemusic.bandcamp.com/"
            target="_blank"
          >
            Bandcamp
          </a>
  
          <a
            href="https://linktr.ee/dystofuturemusic"
            target="_blank"
          >
            Linktree
          </a>
  
          <a
            href="https://www.youtube.com/watch?v=AcfS40ARYEc"
            target="_blank"
          >
            Youtube
          </a>
        </div>
  
        <p className="text-center text-white/30 mt-10 text-sm">
          AUREYX © 2026
        </p>
      </footer>
    );
  }