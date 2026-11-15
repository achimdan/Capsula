# Instrucțiuni pentru Capsula

- Interfața și documentația sunt în română, cu diacritice corecte (ș, ț cu virgulă).
- Nu inventa fapte despre locuri, oameni sau ani. Fișele noi intră cu `verificat: false`; anii nesiguri au `an_exact: false`.
- În „Ghicește anul” intră doar fișe cu `an_exact: true`.
- Respectă design system-ul „Banda” din `app/assets/css/banda.css`: un singur accent (`--signal`), folosit doar pentru „ești aici” și Random Hit.
- Codul de server rulează pe Cloudflare Workers: fără API-uri doar pentru Node.
- Deciziile de produs sunt în `docs/PLAN.md`. Actualizează-l când se schimbă ceva.
