import Image from "next/image";
import { profile } from "@/data/content";

export default function About() {
  return (
    <section id="about" className="section section-ink">
      <div className="container about-grid">
        <div className="about-photo">
          {profile.photo ? (
            <Image
              src={profile.photo}
              alt={profile.name}
              fill
              sizes="(max-width: 800px) 100vw, 40vw"
            />
          ) : (
            <span className="photo-placeholder">{profile.initials}</span>
          )}
        </div>
        <div>
          <p className="eyebrow">About me</p>
          <h2 className="section-title">Design with purpose and personality.</h2>
          {profile.bio.map((para, i) => (
            <p key={i} className="about-text">
              {para}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
