import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

const STORAGE_KEY = 'sj_lang';

const translations = {
  ru: {
    language: {
      label: 'Язык',
      ru: 'RU',
      en: 'EN',
      switchToRu: 'Переключить на русский',
      switchToEn: 'Переключить на английский',
    },
    common: {
      menu: 'В меню',
      loading: 'Загружаю...',
      apply: 'Применить',
      any: 'Любой',
      ok: 'Ок',
      order: 'Заказать',
      remove: 'Убрать',
      details: 'Подробнее',
      showMore: 'Показать больше ▼',
      showLess: 'Свернуть ▲',
      favoriteAdd: '♡ В избранное',
      favoriteAdded: '♥ В избранном',
      send: 'Отправить заявку',
      sending: 'Отправляю...',
      update: 'Обновить',
      saving: 'Сохраняю...',
      search: 'Поиск',
      comment: 'Комментарий',
      type: 'Тип',
      budget: 'Бюджет',
      from: 'от',
      to: 'до',
      stones: 'Камни',
      result: 'Результат',
      close: 'Закрыть',
      priceOnRequest: 'Цена по запросу',
      descriptionPlaceholder: 'Описание появится позже.',
      photoSoon: 'Фото скоро',
      pathLabel: 'Путь {{value}}',
      lifePathLabel: 'Число пути: {{value}}',
      lifePathShort: 'Число пути',
    },
    hero: {
      brand: 'SKY JEWELRY',
      title: 'Камни, которые слышат твою душу',
      start: 'Начать',
      catalog: 'Каталог',
      logoAlt: 'Логотип Sky Jewelry',
    },
    cover: {
      lead: 'Я помогу найти камень, который отзовётся на твою душу, и создам украшение — личное, как амулет.',
      steps: {
        profile: {
          title: 'Точка входа',
          text:
            'Опираемся на твой запрос, текущее состояние и дату рождения, чтобы определить твой энергетический код и подобрать камни точнее.',
        },
        stone: {
          title: 'Подбор камня',
          text: 'Выбираем минералы, которые поддержат тебя в текущем запросе: деньги, любовь, защита, путь.',
        },
        catalog: {
          title: 'Каталог украшений',
          text: 'Показываем готовые украшения с подобранными камнями — можно сразу выбрать то, что откликается.',
        },
        custom: {
          title: 'Индивидуальный проект',
          text: 'Создаём украшение под тебя: ты описываешь запрос — мастер собирает личный амулет.',
        },
      },
    },
    mainMenu: {
      welcome: 'Добро пожаловать, {{name}}',
      guest: 'гость',
      subtitle:
        'Подберу минералы по твоей энергии, покажу украшения Sky Jewelry и помогу собрать индивидуальное изделие.',
      navigation: 'Навигация',
      backAria: 'Вернуться',
      items: {
        profile: 'Мой профиль',
        stone: 'Подбор камня',
        catalog: 'Каталог украшений',
        custom: 'Индивидуальное украшение',
        library: 'Энергия камней',
        reviews: 'Отзывы',
        history: 'История бренда',
        favorites: 'Избранное',
      },
    },
    birthdate: {
      kicker: 'Профиль',
      title: 'Дата рождения',
      subtitle: 'Используется для расчёта числа пути и точного подбора минералов.',
      label: 'Выбери дату',
      note: 'Дата сохранится в Supabase и будет использоваться при подборе камней.',
      save: 'Сохранить и продолжить',
    },
    profile: {
      kicker: 'Моя энергетическая карта',
      title: 'Sky Jewelry Profile',
      subtitle:
        'Персональный подбор камней и украшений по твоей энергии — рекомендации, которые раскрывают твой стиль и состояние.',
      hint: 'Укажи дату рождения, чтобы я смог подобрать твои камни.',
      identifiers: 'Твои идентификаторы',
      labels: {
        telegramId: 'Telegram ID',
        username: 'Username',
        name: 'Имя',
      },
      energyBlock: 'Энергетический блок',
      birthdateLabel: 'Дата рождения',
      birthdatePlaceholder: 'ДД.ММ.ГГГГ',
      noteSaved: 'Данные обновлены.',
      lifePathLabel: 'Число пути',
      trustNote: 'Эти данные используются только для персонального подбора камней и не передаются третьим лицам.',
      lifePath: {
        missing: 'Добавь дату рождения, чтобы узнать свой путь.',
        default: 'Твоя энергетика активируется после указания даты рождения.',
        '1': 'Путь лидерства и инициативы.',
        '2': 'Путь баланса и дипломатии.',
        '3': 'Путь творчества и самовыражения.',
        '4': 'Путь структуры и силы.',
        '5': 'Путь перемен и свободы.',
        '6': 'Путь заботы и гармонии.',
        '7': 'Путь интуиции и знаний.',
        '8': 'Путь реализации и энергии.',
        '9': 'Путь служения и мудрости.',
        '11': 'Путь вдохновения и идей.',
        '22': 'Путь созидания и масштаба.',
      },
    },
    stonePicker: {
      kicker: 'Подбор камня',
      title: 'С каким запросом работаешь?',
      subtitle: 'Я посмотрю камни, которые лучше всего поддержат тебя сейчас.',
      chooseTheme: 'Выбери тему',
      themePlaceholder: 'Выбери тему под запрос',
      loadingThemes: 'Загружаю темы...',
      loadingRecommendations: 'Собираю рекомендации...',
      canChange: 'Темы можно менять — подберу новые связки камней.',
      resultEmpty: 'После выбора темы здесь появятся камни.',
      primary: 'главный',
      secondary: 'дополнительный',
      showProducts: 'Показать украшения с этим камнем',
    },
    catalog: {
      kicker: 'Каталог',
      title: 'Украшения с твоими камнями',
      subtitle: 'Фильтруй по камню и типу. Нажми на карточку, чтобы оставить заявку через бота.',
      stoneHint: 'Можно выбрать несколько камней — просто нажимай по пунктам.',
      typeLabel: 'Тип украшения',
      itemsTitle: 'Украшения',
      empty: 'Не нашел украшения под этот фильтр.',
      customCta: 'Собрать индивидуально',
    },
    custom: {
      kicker: 'Индивидуальное украшение',
      title: 'Соберём под твой запрос',
      subtitle: 'Выбери камни, тип украшения и бюджет. Мастер получит заявку в Telegram.',
      stoneHint: 'Можно выбрать несколько камней — просто нажимай по пунктам.',
      other: 'Другое',
      commentPlaceholder: 'Опиши запрос, ощущения, цвета, важные детали',
    },
    library: {
      kicker: 'Энергия камней',
      title: 'Справочник минералов',
      subtitle: 'Краткие заметки о том, что усиливает каждый камень.',
      searchPlaceholder: 'Например: турмалин, защита, любовь',
      loadError: 'Не удалось загрузить список камней. Попробуй позже.',
    },
    brandStory: {
      kicker: 'История бренда / Мастерская',
      title: 'Sky Jewelry',
      subtitle: 'Ручная работа, смысл и энергия, прожитые в тишине и готовые к твоей истории.',
      authorLabel: 'Автор',
      authorName: 'Евгений Пламеннов',
      authorNote: 'Живой тест минералов. Магия и ювелирное ремесло — как единый язык.',
      blocks: [
        {
          title: 'Настройка, а не продукт',
          text:
            'Мы создаём очень ограниченное количество изделий и большую часть времени посвящаем не производству, а глубокому тестированию каждого минерала — сначала на себе, затем в живой практике с людьми. Камень никогда не используется «вслепую»: он проживается, чувствуется и проверяется во времени. Украшение SkyJewelry — это не продукт для витрины. Это — настройка.',
        },
        {
          title: 'Наш человек',
          text:
            'Наш человек — тот, кто чувствует: не все задачи решаются логикой и умом. Он приходит с внутренним состоянием: «Я верю и позволяю чудесам происходить в моей жизни». И уходит с ощущением вдохновлённости, наполненности, принятия, любви и понимания, что с ним всё в порядке.',
        },
        {
          title: 'Атмосфера',
          text:
            'SkyJewelry — это магия, энергия и воля. Мир, похожий на восточную сказку, где живут специи, джины и чудеса, и где тонкое и материальное существуют вместе.',
        },
        {
          title: 'Новый уровень',
          text:
            'Долгое время SkyJewelry существовал камерно — как путь для себя и узкого круга. Любой живой процесс готов выйти за пределы личного пространства: сегодня мы на пороге нового уровня, но не как массовый продукт, а как зрелая форма того, что годы проживалось в тишине.',
        },
        {
          title: 'Взгляд в будущее',
          text:
            'По мере повышения чувствительности людей и изменения вибраций планеты человечество будет глубже понимать влияние энергий. SkyJewelry поможет в этом пути — создавая браслеты, бусы и домашние минералы‑гармонизаторы как инструменты осознанного самопрограммирования.',
        },
        {
          title: 'Наследие',
          text:
            'То, что мы хотим оставить — знание и понимание: камни работают, и человек способен осознанно взаимодействовать с реальностью. SkyJewelry существует потому, что я верю в магию. И потому что выбираю жить в сказке. SkyJewelry — украшения, которые помнят, кто ты есть.',
        },
      ],
    },
    favorites: {
      title: 'Избранное',
      subtitle: 'Сохраняй украшения, чтобы вернуться к ним позже.',
      empty: 'Пока пусто. Добавь украшение из каталога.',
    },
    reviews: {
      kicker: 'Отзывы',
      title: 'Голоса клиентов',
      subtitle: 'Живые истории о мастере и работе с камнями.',
      showMore: 'Показать ещё',
      hide: 'Скрыть',
      items: [
        {
          author: 'Кира',
          text:
            'Мне было очень приятно взаимодействовать с Евгением. В его присутствии я чувствовала себя как дома, ощущала его поддержку, искреннее присутствие и глубокое внимание к моим словам. Эти составляющие позволили мне расслабиться и полностью раскрыться и для себя, и для него.\n\nЕвгений уделил мне много времени, рассказывая про разные камни, как они работают и как влияют на наше состояние и жизнь в целом. Он терпеливо отвечал на все мои многочисленные вопросы и открыл новое для меня измерение минералов.\n\nМне очень понравилось работать с камнями! ... Я выбрала 3 камня, и позже выяснилось, что именно эти камни обладают теми качествами, которых мне по моему мнению недостаёт!\n\nВ итоге я выбрала один камень и мы вместе собрали голубой браслет! Здесь чувствовалось, что мы вкладывали наши сердца и намерение в мой браслет. Он почти живой :)\n\nБлагодарю за время, сердечную атмосферу и заряженный браслет!',
        },
        {
          author: 'Андрей и команда',
          text:
            'Сегодня полдня провели с уникальными мастерами! Рассматривать и чувствовать, выбирать свой камень — это целое путешествие.\n\nДух камня и энергетика мастера ощущаются с первого шага за порог. Вы попадаете на новый энергетический уровень и наверняка найдёте свой кристалл. Мастер сделает украшение из вашего камня и вложит туда знания и энергию, чтобы он работал на вас и защищал.\n\nБлагодарим ребят за творчество, знания и радушный приём!',
        },
        {
          author: 'Екатерина Кузьмина',
          text:
            'Встреча с Женей была событием. В Питере хотела познакомиться с камнями, но не срослось, а на Пангане жизнь свела с мастером, который верит и любит своё дело.\n\nПоняла вкус вещей из рук мастера. Женя показал камни, дал почувствовать и выбрать. Собрали браслет, потом ещё один и серёжки.\n\nЯ чувствую влияние камней: агатовый браслет — хочется петь, родохрозит — согревает сердце, чароит — соединяет с пространством, лунный камень — помогает проявлять женственность. Рекомендую Женю как мастера и камни как инструмент. Подарите себе красоту!',
        },
        {
          author: 'Диана',
          text:
            'Женя рассказал мне о камнях так, что я поняла их воздействие, силу и красоту. Благодарю его за это!\n\nРаньше покупала только лабрадорит, а теперь вижу глубину минералов. Женя посвятил время, чтобы объяснить и почувствовать камни.',
        },
        {
          author: 'Катя',
          text:
            'Хотела познакомиться с камнями, увидеть как они растут и какие свойства дают. На сеансе подобрали 3 камня под мой запрос — из них можно сделать любое украшение, индивидуально. Благодарю!',
        },
        {
          author: 'Anastasia Shanti',
          text:
            'Женя — чистый и добрый человек. Каждая вещь, к которой он прикасается, оживает и напитывается энергией любви.\n\nБлагодарю за браслеты из красивых и сильных кристаллов. Они живые и любящие, гармонизируют энергию, придают плавность событиям. Ничего другого не хочется носить — их достаточно, чтобы чувствовать себя изобильно и роскошно.\n\nЖелаю, чтобы как можно больше людей познали силу кристаллов через руки и сердце мастера!',
        },
        {
          author: 'Shakima',
          text:
            'Консультация с мастером: благодарю за заботливое общение и помощь в подборе камней.\n\nЖеня чувствует, с каким камнем нужно побыть подольше. Его любящий и внимательный взгляд вдохновляет и придаёт силы. Украшение становится любимым талисманом, поддерживающим на всех уровнях. Рекомендую друзьям попасть на индивидуальный подбор украшения!',
        },
      ],
    },
    preAuth: {
      title: 'Вход',
      subtitle: 'Подключаю профиль…',
      caption: 'Займёт несколько секунд',
    },
    preloader: {
      tag: 'Sky Jewelry',
      title: 'Загружаю твою Вселенную',
      defaultText: 'Камни, которые слышат твою душу...',
    },
    confirm: {
      ok: 'Ок',
    },
    app: {
      toast: {
        stonesLoadError: 'Не удалось загрузить список камней.',
        catalogLoadError: 'Не удалось загрузить каталог.',
        themesLoadError: 'Не удалось загрузить темы.',
        birthdateSaved: 'Дата рождения сохранена',
        birthdateSaveError: 'Не удалось сохранить дату. Проверь подключение.',
        stonePickError: 'Не удалось подобрать камни. Попробуй ещё раз.',
        sendError: 'Не удалось отправить, попробуйте ещё раз.',
      },
      modal: {
        orderTitle: 'Заказ принят',
        orderText: 'Наш менеджер скоро свяжется с вами.',
      },
      order: {
        catalogComment: 'Каталог: {{name}} (id {{id}})',
      },
    },
    themes: {
      energy_resource: 'Энергия и ресурс',
      inner_strength: 'Внутренняя сила',
      clarity_focus: 'Ясность и фокус',
      intuition_path: 'Интуиция и путь',
      confidence_charisma: 'Уверенность и харизма',
      balance_harmony: 'Баланс и гармония',
      healing_restore: 'Исцеление и восстановление',
      luck_flow: 'Удача и поток',
      energy_protection: 'Защита энергии',
      selflove: 'Самооценка и любовь к себе',
    },
    types: {
      bracelet: 'Браслет',
      necklace: 'Колье',
      ring: 'Кольцо',
      talisman: 'Талисман',
      other: 'Другое',
    },
  },
  en: {
    language: {
      label: 'Language',
      ru: 'RU',
      en: 'EN',
      switchToRu: 'Switch to Russian',
      switchToEn: 'Switch to English',
    },
    common: {
      menu: 'Back to menu',
      loading: 'Loading...',
      apply: 'Apply',
      any: 'Any',
      ok: 'OK',
      order: 'Order',
      remove: 'Remove',
      details: 'More details',
      showMore: 'Show more ▼',
      showLess: 'Collapse ▲',
      favoriteAdd: '♡ Save',
      favoriteAdded: '♥ Saved',
      send: 'Send request',
      sending: 'Sending...',
      update: 'Update',
      saving: 'Saving...',
      search: 'Search',
      comment: 'Comment',
      type: 'Type',
      budget: 'Budget',
      from: 'from',
      to: 'to',
      stones: 'Stones',
      result: 'Result',
      close: 'Close',
      priceOnRequest: 'Price on request',
      descriptionPlaceholder: 'Description coming soon.',
      photoSoon: 'Photo soon',
      pathLabel: 'Path {{value}}',
      lifePathLabel: 'Life path: {{value}}',
      lifePathShort: 'Life path',
    },
    hero: {
      brand: 'SKY JEWELRY',
      title: 'Stones that hear your soul',
      start: 'Start',
      catalog: 'Catalog',
      logoAlt: 'Sky Jewelry eye logo',
    },
    cover: {
      lead: "I'll help you find a stone that resonates with your soul and create a piece of jewelry — personal, like an amulet.",
      steps: {
        profile: {
          title: 'Entry point',
          text:
            'We lean on your request, current state, and birthdate to define your energy code and select stones more precisely.',
        },
        stone: {
          title: 'Stone selection',
          text: 'We choose minerals that support your current intention: money, love, protection, path.',
        },
        catalog: {
          title: 'Jewelry catalog',
          text: 'We show ready-made pieces with selected stones — choose what resonates right away.',
        },
        custom: {
          title: 'Custom project',
          text: 'We craft jewelry for you: you describe the intention — the master assembles a personal amulet.',
        },
      },
    },
    mainMenu: {
      welcome: 'Welcome, {{name}}',
      guest: 'guest',
      subtitle: "I'll match minerals to your energy, show Sky Jewelry pieces, and help craft a custom item.",
      navigation: 'Navigation',
      backAria: 'Back',
      items: {
        profile: 'My profile',
        stone: 'Stone selection',
        catalog: 'Jewelry catalog',
        custom: 'Custom jewelry',
        library: 'Stone energy',
        reviews: 'Reviews',
        history: 'Brand story',
        favorites: 'Favorites',
      },
    },
    birthdate: {
      kicker: 'Profile',
      title: 'Birthdate',
      subtitle: 'Used to calculate your life path number and refine mineral selection.',
      label: 'Select date',
      note: 'The date will be saved in Supabase and used for stone selection.',
      save: 'Save and continue',
    },
    profile: {
      kicker: 'My energy map',
      title: 'Sky Jewelry Profile',
      subtitle: 'Personalized stone and jewelry selection based on your energy — recommendations that reveal your style and state.',
      hint: 'Add your birthdate so I can pick your stones.',
      identifiers: 'Your identifiers',
      labels: {
        telegramId: 'Telegram ID',
        username: 'Username',
        name: 'Name',
      },
      energyBlock: 'Energy block',
      birthdateLabel: 'Birthdate',
      birthdatePlaceholder: 'DD.MM.YYYY',
      noteSaved: 'Details updated.',
      lifePathLabel: 'Life path',
      trustNote: 'These data are used only for personalized stone selection and are not shared with third parties.',
      lifePath: {
        missing: 'Add your birthdate to learn your path.',
        default: 'Your energy activates after you enter your birthdate.',
        '1': 'Path of leadership and initiative.',
        '2': 'Path of balance and diplomacy.',
        '3': 'Path of creativity and self-expression.',
        '4': 'Path of structure and strength.',
        '5': 'Path of change and freedom.',
        '6': 'Path of care and harmony.',
        '7': 'Path of intuition and knowledge.',
        '8': 'Path of achievement and energy.',
        '9': 'Path of service and wisdom.',
        '11': 'Path of inspiration and ideas.',
        '22': 'Path of creation and scale.',
      },
    },
    stonePicker: {
      kicker: 'Stone selection',
      title: 'What intention are you working with?',
      subtitle: "I'll look for stones that best support you right now.",
      chooseTheme: 'Choose a theme',
      themePlaceholder: 'Choose a theme for your intention',
      loadingThemes: 'Loading themes...',
      loadingRecommendations: 'Gathering recommendations...',
      canChange: "You can change themes — I'll pick new stone combinations.",
      resultEmpty: 'After choosing a theme, stones will appear here.',
      primary: 'primary',
      secondary: 'secondary',
      showProducts: 'Show jewelry with this stone',
    },
    catalog: {
      kicker: 'Catalog',
      title: 'Jewelry with your stones',
      subtitle: 'Filter by stone and type. Tap a card to send a request via the bot.',
      stoneHint: 'You can select multiple stones — just tap the items.',
      typeLabel: 'Jewelry type',
      itemsTitle: 'Jewelry',
      empty: 'No jewelry found for these filters.',
      customCta: 'Build a custom request',
    },
    custom: {
      kicker: 'Custom jewelry',
      title: "We'll craft it for your request",
      subtitle: 'Choose stones, jewelry type, and budget. The master will receive the request in Telegram.',
      stoneHint: 'You can select multiple stones — just tap the items.',
      other: 'Other',
      commentPlaceholder: 'Describe your intention, feelings, colors, key details',
    },
    library: {
      kicker: 'Stone energy',
      title: 'Mineral guide',
      subtitle: 'Short notes on what each stone strengthens.',
      searchPlaceholder: 'e.g., tourmaline, protection, love',
      loadError: "Couldn't load the stone list. Try later.",
    },
    brandStory: {
      kicker: 'Brand story / Atelier',
      title: 'Sky Jewelry',
      subtitle: 'Handcrafted meaning and energy — lived in silence and ready for your story.',
      authorLabel: 'Author',
      authorName: 'Евгений Пламеннов',
      authorNote: 'Living mineral tester. Magic and jewelry craft as a single language.',
      blocks: [
        {
          title: 'Tuning, not a product',
          text:
            'We create a very limited number of pieces and spend most of our time not on production but on deep testing of each mineral — first on ourselves, then in live practice with people. A stone is never used blindly: it is lived with, felt, and proven over time. A SkyJewelry piece is not a showcase product. It is a tuning.',
        },
        {
          title: 'Our person',
          text:
            'Our person is someone who feels that not all tasks are solved by logic and mind. They come with an inner state: "I believe and allow miracles to happen in my life." And they leave with a sense of inspiration, fullness, acceptance, love, and the understanding that everything is okay with them.',
        },
        {
          title: 'Atmosphere',
          text:
            'SkyJewelry is magic, energy, and will. A world like an Eastern fairy tale where spices, genies, and miracles live, and where the subtle and the material exist together.',
        },
        {
          title: 'A new level',
          text:
            'For a long time SkyJewelry lived in an intimate format — a path for ourselves and a close circle. Any living process is ready to go beyond personal space: today we are on the threshold of a new level, not as a mass product, but as a mature form of what was lived through in silence for years.',
        },
        {
          title: 'Looking ahead',
          text:
            "As people's sensitivity grows and the planet's vibrations change, humanity will understand the influence of energies more deeply. SkyJewelry will help on this path — creating bracelets, beads, and home mineral harmonizers as tools of conscious self-programming.",
        },
        {
          title: 'Legacy',
          text:
            'What we want to leave is knowledge and understanding: stones work, and a person can consciously interact with reality. SkyJewelry exists because I believe in magic. And because I choose to live in a fairy tale. SkyJewelry is jewelry that remembers who you are.',
        },
      ],
    },
    favorites: {
      title: 'Favorites',
      subtitle: 'Save jewelry to return to it later.',
      empty: 'Nothing here yet. Add a piece from the catalog.',
    },
    reviews: {
      kicker: 'Reviews',
      title: 'Client voices',
      subtitle: 'Real stories about the master and working with stones.',
      showMore: 'Show more',
      hide: 'Hide',
      items: [
        {
          author: 'Кира',
          text:
            'Working with Evgeny was a real pleasure. In his presence I felt at home, felt his support, sincere presence, and deep attention to my words. That allowed me to relax and open up fully — to myself and to him.\n\nEvgeny spent a lot of time with me, talking about different stones, how they work and how they affect our state and life in general. He patiently answered all my many questions and opened a new dimension of minerals for me.\n\nI really enjoyed working with stones! ... I chose 3 stones, and later it turned out that these stones have exactly the qualities I felt I was missing.\n\nIn the end I chose one stone and together we assembled a blue bracelet! It felt like we were putting our hearts and intention into my bracelet. It is almost alive :)\n\nThank you for the time, the warm atmosphere, and the charged bracelet!',
        },
        {
          author: 'Андрей и команда',
          text:
            "Today we spent half a day with unique masters! Looking, feeling, and choosing your stone is a whole journey.\n\nThe spirit of the stone and the master's energy are felt from the first step inside. You reach a new energetic level and will surely find your crystal. The master will make jewelry from your stone and put knowledge and energy into it so it works for you and protects you.\n\nThank you to the team for their creativity, knowledge, and warm welcome!",
        },
        {
          author: 'Екатерина Кузьмина',
          text:
            "Meeting Zhenya was an event. In Saint Petersburg I wanted to get to know stones, but it didn't work out, and on Phangan life brought me to a master who believes in and loves his craft.\n\nI understood the taste of things made by a master's hands. Zhenya showed the stones, let me feel and choose. We assembled a bracelet, then another one and earrings.\n\nI feel the influence of stones: an agate bracelet — makes me want to sing, rhodochrosite — warms the heart, charoite — connects with space, moonstone — helps reveal femininity. I recommend Zhenya as a master and stones as a tool. Gift yourself beauty!",
        },
        {
          author: 'Диана',
          text:
            'Zhenya told me about stones in a way that I understood their effect, power, and beauty. Thank you for that!\n\nI used to buy only labradorite, and now I see the depth of minerals. Zhenya took time to explain and help me feel the stones.',
        },
        {
          author: 'Катя',
          text:
            'I wanted to get to know stones, see how they grow and what qualities they give. During the session we selected 3 stones for my request — from them you can make any jewelry, custom-made. Thank you!',
        },
        {
          author: 'Anastasia Shanti',
          text:
            "Zhenya is a pure and kind person. Everything he touches comes alive and is filled with the energy of love.\n\nThank you for the bracelets made of beautiful and strong crystals. They are living and loving, harmonize energy, and add smoothness to events. I do not want to wear anything else — they are enough to feel abundant and luxurious.\n\nI wish as many people as possible could discover the power of crystals through the master's hands and heart!",
        },
        {
          author: 'Shakima',
          text:
            'Consultation with the master: thank you for caring communication and help selecting stones.\n\nZhenya feels which stone you need to spend more time with. His loving and attentive gaze inspires and gives strength. The jewelry becomes a favorite talisman that supports on all levels. I recommend friends to come for a personal jewelry selection!',
        },
      ],
    },
    preAuth: {
      title: 'Sign in',
      subtitle: 'Connecting your profile…',
      caption: 'Takes a few seconds',
    },
    preloader: {
      tag: 'Sky Jewelry',
      title: 'Loading your universe',
      defaultText: 'Stones that hear your soul...',
    },
    confirm: {
      ok: 'OK',
    },
    app: {
      toast: {
        stonesLoadError: "Couldn't load the stone list.",
        catalogLoadError: "Couldn't load the catalog.",
        themesLoadError: "Couldn't load themes.",
        birthdateSaved: 'Birthdate saved',
        birthdateSaveError: "Couldn't save the date. Check your connection.",
        stonePickError: "Couldn't pick stones. Try again.",
        sendError: "Couldn't send, please try again.",
      },
      modal: {
        orderTitle: 'Order received',
        orderText: 'Our manager will contact you soon.',
      },
      order: {
        catalogComment: 'Catalog: {{name}} (id {{id}})',
      },
    },
    themes: {
      energy_resource: 'Energy & resource',
      inner_strength: 'Inner strength',
      clarity_focus: 'Clarity & focus',
      intuition_path: 'Intuition & path',
      confidence_charisma: 'Confidence & charisma',
      balance_harmony: 'Balance & harmony',
      healing_restore: 'Healing & restoration',
      luck_flow: 'Luck & flow',
      energy_protection: 'Energy protection',
      selflove: 'Self-worth & self-love',
    },
    types: {
      bracelet: 'Bracelet',
      necklace: 'Necklace',
      ring: 'Ring',
      talisman: 'Talisman',
      other: 'Other',
    },
  },
} as const;

export type Locale = keyof typeof translations;

type I18nValue = string | number | boolean | null | I18nValue[] | { [key: string]: I18nValue };

type TranslateParams = Record<string, string | number | null | undefined> & { defaultValue?: string };

type I18nContextValue = {
  locale: Locale;
  setLocale: (next: Locale) => void;
  t: (key: string, params?: TranslateParams) => string;
  get: (key: string) => I18nValue | undefined;
};

const fallbackLocale: Locale = 'ru';

function getValue(locale: Locale, key: string): I18nValue | undefined {
  const segments = key.split('.');
  let current: any = translations[locale];
  for (const segment of segments) {
    if (!current || typeof current !== 'object' || !(segment in current)) return undefined;
    current = (current as any)[segment];
  }
  return current as I18nValue;
}

function detectLocale(): Locale {
  if (typeof window === 'undefined') return fallbackLocale;
  try {
    const stored = window.localStorage?.getItem(STORAGE_KEY);
    if (stored === 'ru' || stored === 'en') return stored;
  } catch {
    // ignore
  }
  const tgLang = (window as any)?.Telegram?.WebApp?.initDataUnsafe?.user?.language_code;
  const browserLang = typeof navigator !== 'undefined' ? navigator.language : '';
  const candidate = `${tgLang ?? ''}`.trim() || `${browserLang ?? ''}`.trim();
  return candidate.toLowerCase().startsWith('ru') ? 'ru' : 'en';
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => detectLocale());

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale;
    }
    try {
      window.localStorage?.setItem(STORAGE_KEY, locale);
    } catch {
      // ignore
    }
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
  }, []);

  const get = useCallback(
    (key: string): I18nValue | undefined => {
      const primary = getValue(locale, key);
      if (primary !== undefined) return primary;
      return getValue(fallbackLocale, key);
    },
    [locale],
  );

  const t = useCallback(
    (key: string, params?: TranslateParams): string => {
      const value = get(key);
      const { defaultValue, ...rest } = params ?? {};
      const template = typeof value === 'string' ? value : defaultValue ?? key;
      return template.replace(/\{\{(\w+)\}\}/g, (_, token) => {
        const replacement = (rest as Record<string, string | number | null | undefined>)[token];
        if (replacement === null || replacement === undefined) return '';
        return String(replacement);
      });
    },
    [get],
  );

  const contextValue = useMemo(
    () => ({
      locale,
      setLocale,
      t,
      get,
    }),
    [locale, setLocale, t, get],
  );

  return <I18nContext.Provider value={contextValue}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within LanguageProvider');
  }
  return context;
}

export const SUPPORTED_LOCALES: Locale[] = ['ru', 'en'];
