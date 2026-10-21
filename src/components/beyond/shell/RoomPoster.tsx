import styles from "./RoomPoster.module.css";

export default function RoomPoster() {
  return (
    <svg
      className={styles.poster}
      data-room-poster="true"
      viewBox="0 0 1200 700"
      role="img"
      aria-labelledby="room-poster-title room-poster-description"
      focusable="false"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title id="room-poster-title">A room with a view</title>
      <desc id="room-poster-description">
        A lilac room with a wide window over green hills, a blue desk, a yellow chair and a small plant.
      </desc>
      <path d="M70 70h1060v480H70z" fill="#B9A3FF" stroke="#16131A" strokeWidth="10" />
      <path d="M70 550h1060v80H70z" fill="#FF7A3D" stroke="#16131A" strokeWidth="10" />
      <path d="M70 630 350 550h780v80z" fill="#E96A35" stroke="#16131A" strokeWidth="10" />
      <path d="M685 125h370v266H685z" fill="#3FA9F5" stroke="#16131A" strokeWidth="12" />
      <path d="m685 335 110-94 86 52 78-103 96 83v118H685z" fill="#7EE0B5" />
      <path d="m685 354 112-58 89 46 78-64 91 38v75H685z" fill="#FFE05A" />
      <path d="M870 125v266M685 258h370" fill="none" stroke="#16131A" strokeWidth="10" />
      <path d="M250 476h540v38H250z" fill="#3FA9F5" stroke="#16131A" strokeWidth="10" />
      <path d="m292 514-24 118M748 514l24 118" fill="none" stroke="#16131A" strokeLinecap="round" strokeWidth="14" />
      <path d="M478 392h138l34 84H444z" fill="#16131A" />
      <path d="M491 404h112l23 57H468z" fill="#FFE05A" />
      <path d="M427 474h237l20 14H407z" fill="#16131A" />
      <path d="M858 478h123v35H858z" fill="#FF7A3D" stroke="#16131A" strokeWidth="9" />
      <path d="M874 478v-46h91v46" fill="#FFE05A" stroke="#16131A" strokeWidth="9" />
      <path d="M904 431v-58" stroke="#16131A" strokeWidth="8" />
      <path d="M893 373h23l17 24h-58z" fill="#FFE05A" stroke="#16131A" strokeWidth="8" />
      <path d="M178 546h100v78H178z" fill="#FFE05A" stroke="#16131A" strokeWidth="10" />
      <path d="M194 545v-83M262 545v-106M226 545v-122" stroke="#16131A" strokeWidth="8" />
      <path d="M194 479c-39-17-42-52-16-63 21-9 35 19 16 63ZM262 462c30-24 28-54 5-59-21-4-29 27-5 59ZM226 445c-34-22-29-53-6-58 22-4 28 25 6 58Z" fill="#7EE0B5" stroke="#16131A" strokeLinejoin="round" strokeWidth="8" />
      <path d="M338 548h102v68H338z" fill="#FFF8EC" stroke="#16131A" strokeWidth="9" />
      <path d="M438 564h13v34h-13" fill="none" stroke="#16131A" strokeWidth="8" />
    </svg>
  );
}
