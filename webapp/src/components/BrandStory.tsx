import '../App.css';
import backIcon from '../assets/icon-arrow-left.svg';

type Props = {
  onBack: () => void;
};

const authorPhoto =
  'https://kyxztleagpawfhkvxvwa.supabase.co/storage/v1/object/sign/Cover/Autor.jpeg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8wMGI3NGEwZi1jMTViLTRmYzQtYWIzMS0yMzdiMTE3OGY0MWEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJDb3Zlci9BdXRvci5qcGVnIiwiaWF0IjoxNzY1Nzk0NTYxLCJleHAiOjE3OTczMzA1NjF9.cSvZNla8uLWxTvTukrsY6TVNRVji_yIaLFtA0YbXu0o';

const storyBlocks = [
  {
    title: 'Настройка, а не продукт',
    text: `Мы создаём очень ограниченное количество изделий и большую часть времени посвящаем не производству, а глубокому тестированию каждого минерала — сначала на себе, затем в живой практике с людьми. Камень никогда не используется «вслепую»: он проживается, чувствуется и проверяется во времени. Украшение SkyJewelry — это не продукт для витрины. Это — настройка.`,
  },
  {
    title: 'Наш человек',
    text: `Наш человек — тот, кто чувствует: не все задачи решаются логикой и умом. Он приходит с внутренним состоянием: «Я верю и позволяю чудесам происходить в моей жизни». И уходит с ощущением вдохновлённости, наполненности, принятия, любви и понимания, что с ним всё в порядке.`,
  },
  {
    title: 'Атмосфера',
    text: `SkyJewelry — это магия, энергия и воля. Мир, похожий на восточную сказку, где живут специи, джины и чудеса, и где тонкое и материальное существуют вместе.`,
  },
  {
    title: 'Новый уровень',
    text: `Долгое время SkyJewelry существовал камерно — как путь для себя и узкого круга. Любой живой процесс готов выйти за пределы личного пространства: сегодня мы на пороге нового уровня, но не как массовый продукт, а как зрелая форма того, что годы проживалось в тишине.`,
  },
  {
    title: 'Взгляд в будущее',
    text: `По мере повышения чувствительности людей и изменения вибраций планеты человечество будет глубже понимать влияние энергий. SkyJewelry поможет в этом пути — создавая браслеты, бусы и домашние минералы‑гармонизаторы как инструменты осознанного самопрограммирования.`,
  },
  {
    title: 'Наследие',
    text: `То, что мы хотим оставить — знание и понимание: камни работают, и человек способен осознанно взаимодействовать с реальностью. SkyJewelry существует потому, что я верю в магию. И потому что выбираю жить в сказке. SkyJewelry — украшения, которые помнят, кто ты есть.`,
  },
];

export default function BrandStory({ onBack }: Props) {
  return (
    <div className="screen story-screen">
      <div className="hero story-hero">
        <div className="story-hero-text">
          <div className="tiny">История бренда / Мастерская</div>
          <h1>Sky Jewelry</h1>
          <p className="muted">Ручная работа, смысл и энергия, прожитые в тишине и готовые к твоей истории.</p>
        </div>
        <div className="story-author full">
          <div className="story-photo-frame large full">
            <img className="story-photo" src={authorPhoto} alt="Евгений Пламеннов" />
            <div className="story-photo-glow" />
          </div>
          <div className="story-author-meta">
            <div className="tiny">Автор</div>
            <div className="story-author-name">Евгений Пламеннов</div>
            <p className="muted" style={{ textAlign: 'left' }}>
              Живой тест минералов. Магия и ювелирное ремесло — как единый язык.
            </p>
          </div>
        </div>
      </div>

      <div className="panel story-panel">
        <div className="story-grid">
          {storyBlocks.map((block) => (
            <div className="story-card" key={block.title}>
              <div className="story-card-title">{block.title}</div>
              <p className="story-card-text">{block.text}</p>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 18 }}>
          <button className="button ghost" onClick={onBack}>
            <img className="btn-icon" src={backIcon} alt="" />
            В меню
          </button>
        </div>
      </div>
    </div>
  );
}
