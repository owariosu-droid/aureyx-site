import SocialIcon from "@/components/SocialIcon";

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
          <a className="social-icon-link"
            href="https://open.spotify.com/artist/1IwiBlGpQaMr8dV7u5LtjI"
            target="_blank"
            rel="noopener noreferrer"
          >
            <SocialIcon platform="Spotify" /> Spotify
          </a>
  
          <a className="social-icon-link"
            href="https://dystofuturemusic.bandcamp.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <SocialIcon platform="Bandcamp" /> Bandcamp
          </a>
  
          <a className="social-icon-link"
            href="https://linktr.ee/dystofuturemusic"
            target="_blank"
            rel="noopener noreferrer"
          >
            <SocialIcon platform="Linktree" /> Linktree
          </a>
  
          <a className="social-icon-link"
            href="https://www.youtube.com/watch?v=AcfS40ARYEc"
            target="_blank"
            rel="noopener noreferrer"
          >
            <SocialIcon platform="YouTube" /> YouTube
          </a>
        </div>
  
        <p className="text-center text-white/30 mt-10 text-sm">
          AUREYX © 2026
        </p>
      </footer>
    );
  }
