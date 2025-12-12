import { useEffect, useMemo, useState } from 'react';
import './index.css';
import './App.css';
import { initSession, pickStone, updateBirthdate, getProducts, getStones, submitCustomRequest } from './api';
import type {
  CustomRequestPayload,
  Product,
  Screen,
  Stone,
  StonePickerResult,
  User,
} from './types';
import Preloader from './components/Preloader';
import Cover from './components/Cover';
import MainMenu from './components/MainMenu';
import BirthdateForm from './components/BirthdateForm';
import Profile from './components/Profile';
import StonePicker from './components/StonePicker';
import Catalog from './components/Catalog';
import CustomRequest from './components/CustomRequest';
import StoneLibrary from './components/StoneLibrary';
import InfoSection from './components/InfoSection';

function extractInitData() {
  const tg = (window as any).Telegram?.WebApp;
  const params = new URLSearchParams(window.location.search);
  const fromUrl = params.get('tgWebAppData') ?? params.get('initData');
  return tg?.initData ?? fromUrl ?? (import.meta.env.VITE_DEV_INIT_DATA as string) ?? '';
}

function App() {
  const [initData, setInitData] = useState('');
  const [screen, setScreen] = useState<Screen>('cover');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [stoneResult, setStoneResult] = useState<StonePickerResult | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [stones, setStones] = useState<Stone[]>([]);
  const [catalogFilters, setCatalogFilters] = useState<{ stone_id?: number; type?: string | null }>({});
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [stonesLoading, setStonesLoading] = useState(false);
  const [pickerLoading, setPickerLoading] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    const tgUser = tg?.initDataUnsafe?.user;
    if (tgUser) {
      setUser({
        id: String(tgUser.id),
        telegram_id: tgUser.id,
        first_name: tgUser.first_name ?? '',
        last_name: tgUser.last_name ?? null,
        username: tgUser.username ?? null,
        photo_url: tgUser.photo_url ?? null,
      });
    }
    tg?.ready?.();
    tg?.expand?.();
    const data = extractInitData();
    setInitData(data);
    (async () => {
      try {
        const { user } = await initSession(data);
        setUser((prev) => ({
          ...user,
          photo_url: prev?.photo_url ?? (user as any)?.photo_url ?? null,
        }));
      } catch (err) {
        console.error('initSession failed', err);
        if (!tgUser) {
          setToast('Не удалось получить initData из Telegram. Открой WebApp из чата.');
        } else {
          setToast('Не удалось инициализировать сессию. Проверь подключение к API.');
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (screen === 'catalog') {
      void refreshCatalog();
      if (!stones.length) void refreshStones();
    }
    if (screen === 'custom' || screen === 'library') {
      if (!stones.length) void refreshStones();
    }
  }, [screen, catalogFilters]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 3800);
    return () => clearTimeout(id);
  }, [toast]);

  const refreshStones = async (search?: string) => {
    setStonesLoading(true);
    try {
      const { stones } = await getStones(initData, search ? { search } : {});
      setStones(stones);
    } catch (err) {
      console.error('getStones failed', err);
      setToast('Не удалось загрузить список камней.');
    } finally {
      setStonesLoading(false);
    }
  };

  const refreshCatalog = async () => {
    setCatalogLoading(true);
    try {
      const { products } = await getProducts(initData, catalogFilters);
      setProducts(products);
    } catch (err) {
      console.error('getProducts failed', err);
      setToast('Не удалось загрузить каталог.');
    } finally {
      setCatalogLoading(false);
    }
  };

  const handleBirthdateUpdate = async (birthdate: string, nextScreen?: Screen): Promise<void> => {
    try {
      const { user } = await updateBirthdate(initData, birthdate);
      setUser((prev) => ({
        ...user,
        photo_url: prev?.photo_url ?? (user as any)?.photo_url ?? null,
      }));
      setToast('Дата рождения сохранена');
      if (nextScreen) setScreen(nextScreen);
    } catch (err) {
      console.error('updateBirthdate failed', err);
      setToast('Не удалось сохранить дату. Проверь подключение.');
    }
  };

  const handleStonePick = async (theme: string) => {
    setPickerLoading(true);
    try {
      const result = await pickStone(initData, theme);
      setStoneResult(result);
      if (result.life_path && user) {
        setUser({ ...user, life_path: result.life_path });
      }
    } catch (err) {
      console.error('pickStone failed', err);
      setToast('Не удалось подобрать камни. Попробуй ещё раз.');
    } finally {
      setPickerLoading(false);
    }
  };

  const handleCustomRequest = async (payload: CustomRequestPayload) => {
    setRequestLoading(true);
    try {
      await submitCustomRequest(initData, payload);
      setToast('Заявка отправлена мастеру');
      setScreen('main');
    } catch (err) {
      console.error('custom request failed', err);
      setToast('Не удалось отправить заявку');
    } finally {
      setRequestLoading(false);
    }
  };

  const handleOpenCatalogWithStone = (stoneId: number) => {
    setCatalogFilters((prev) => ({ ...prev, stone_id: stoneId }));
    setScreen('catalog');
  };

  const content = useMemo(() => {
    if (loading) return <Preloader text="Проверяю подпись Telegram и прогреваю Supabase" />;
    if (screen === 'cover')
      return <Cover onStart={() => setScreen('main')} onCatalog={() => setScreen('catalog')} />;
    if (screen === 'main') return <MainMenu user={user} onNavigate={setScreen} />;
    if (screen === 'birthdate')
      return <BirthdateForm user={user} onSubmit={(date) => handleBirthdateUpdate(date, 'stone')} onBack={() => setScreen('main')} />;
    if (screen === 'profile')
      return <Profile user={user} onSaveBirthdate={(date) => handleBirthdateUpdate(date, 'profile')} onBack={() => setScreen('main')} />;
    if (screen === 'stone')
      return (
        <StonePicker
          result={stoneResult}
          loading={pickerLoading}
          lifePath={user?.life_path ?? null}
          onPick={handleStonePick}
          onOpenCatalog={handleOpenCatalogWithStone}
          onBack={() => setScreen('main')}
        />
      );
    if (screen === 'catalog')
      return (
        <Catalog
          filters={catalogFilters}
          products={products}
          stones={stones}
          loading={catalogLoading}
          onChangeFilters={setCatalogFilters}
          onRefresh={refreshCatalog}
          onBack={() => setScreen('main')}
        />
      );
    if (screen === 'custom')
      return (
        <CustomRequest
          stones={stones}
          onSubmit={handleCustomRequest}
          loading={requestLoading}
          onBack={() => setScreen('main')}
        />
      );
    if (screen === 'library')
      return (
        <StoneLibrary
          stones={stones}
          loading={stonesLoading}
          onSearch={(q) => refreshStones(q)}
          onBack={() => setScreen('main')}
        />
      );
    if (screen === 'reviews')
      return (
        <InfoSection
          title="Отзывы"
          subtitle="Что говорят клиенты Sky Jewelry."
          bullets={['Теплые слова клиентов', 'Истории трансформации', 'Как камни помогли в делах и чувствах']}
          onBack={() => setScreen('main')}
        />
      );
    if (screen === 'history')
      return (
        <InfoSection
          title="История бренда / Мастерская"
          subtitle="О мастерской Sky Jewelry: ручная работа, смысл, энергия."
          bullets={[
            'О мастерской Sky Jewelry',
            'Ручная работа / смысл / энергия',
          ]}
          onBack={() => setScreen('main')}
        />
      );
    if (screen === 'favorites')
      return (
        <InfoSection
          title="Избранное"
          subtitle="Сохраняй камни и украшения, чтобы вернуться к ним позже."
          bullets={['Избранные камни', 'Сохранённые украшения']}
          note="Функция избранного запомнит то, что тебе откликнулось."
          onBack={() => setScreen('main')}
        />
      );
    return null;
  }, [
    loading,
    screen,
    user,
    stoneResult,
    pickerLoading,
    catalogFilters,
    products,
    stones,
    catalogLoading,
    stonesLoading,
    requestLoading,
  ]);

  return (
    <div className="app-shell">
      {content}
      {toast ? <div className="toast">{toast}</div> : null}
    </div>
  );
}

export default App;
