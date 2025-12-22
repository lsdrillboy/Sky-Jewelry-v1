import { useEffect, useMemo, useState } from 'react';
import './index.css';
import './App.css';
import { initSession, pickStone, updateBirthdate, getProducts, getStones, submitCustomRequest, getThemes } from './api';
import type {
  CustomRequestPayload,
  Product,
  Screen,
  Stone,
  StonePickerResult,
  Theme,
  User,
} from './types';
import Cover from './components/Cover';
import MainMenu from './components/MainMenu';
import BirthdateForm from './components/BirthdateForm';
import Profile from './components/Profile';
import StonePicker from './components/StonePicker';
import Catalog from './components/Catalog';
import CustomRequest from './components/CustomRequest';
import StoneLibrary from './components/StoneLibrary';
import BrandStory from './components/BrandStory';
import Favorites from './components/Favorites';
import Reviews from './components/Reviews';
import PreAuth from './components/PreAuth';
import ConfirmModal from './components/ConfirmModal';

function extractInitData() {
  const tg = (window as any).Telegram?.WebApp;
  const params = new URLSearchParams(window.location.search);
  const fromUrl = params.get('tgWebAppData') ?? params.get('initData');
  return tg?.initData ?? fromUrl ?? (import.meta.env.VITE_DEV_INIT_DATA as string) ?? '';
}

function parseUserFromInitData(initData: string): Partial<User> | null {
  if (!initData) return null;
  const params = new URLSearchParams(initData);
  const userStr = params.get('user');
  if (!userStr) return null;
  try {
    const tgUser = JSON.parse(userStr);
    return {
      id: tgUser?.id ? String(tgUser.id) : undefined,
      telegram_id: tgUser?.id,
      first_name: tgUser?.first_name,
      last_name: tgUser?.last_name,
      username: tgUser?.username,
      photo_url: tgUser?.photo_url ?? null,
    };
  } catch (err) {
    console.error('Failed to parse user from initData', err);
    return null;
  }
}

function mergeUser(prev: User | null, next?: Partial<User> | null): User | null {
  if (!next && !prev) return null;
  const merged = {
    ...prev,
    ...next,
  };
  merged.id = merged.id ?? (merged.telegram_id ? String(merged.telegram_id) : prev?.id ?? '');
  merged.photo_url = prev?.photo_url ?? next?.photo_url ?? null;
  return merged as User;
}

function isInitDataValid(data: string | null | undefined) {
  if (!data) return false;
  if (data === 'true') return false;
  return data.length > 10;
}

type PreAuthStage =
  | 'init'
  | 'checking'
  | 'connecting'
  | 'done'
  | 'error-auth'
  | 'error-network'
  | 'error-unknown';

function App() {
  const [initData, setInitData] = useState('');
  const [screen, setScreen] = useState<Screen>('cover');
  const [user, setUser] = useState<User | null>(null);
  const [preAuthStage, setPreAuthStage] = useState<PreAuthStage>('init');
  const [stoneResult, setStoneResult] = useState<StonePickerResult | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [stones, setStones] = useState<Stone[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [catalogFilters, setCatalogFilters] = useState<{ stone_ids?: number[]; type?: string | null }>({});
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [stonesLoading, setStonesLoading] = useState(false);
  const [themesLoading, setThemesLoading] = useState(false);
  const [pickerLoading, setPickerLoading] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);
  const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [orderModal, setOrderModal] = useState<{ title: string; text: string } | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('sj_favorites');
      if (raw) {
        setFavoriteProducts(JSON.parse(raw) as Product[]);
      }
    } catch {
      // ignore
    }
  }, []);

  const persistFavorites = (items: Product[]) => {
    setFavoriteProducts(items);
    try {
      localStorage.setItem('sj_favorites', JSON.stringify(items));
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    bootstrap();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ensureMinDelay = async (startedAt: number, minDelay = 450) => {
    const elapsed = Date.now() - startedAt;
    if (elapsed < minDelay) {
      await new Promise((r) => setTimeout(r, minDelay - elapsed));
    }
  };

  const bootstrap = async () => {
    const startedAt = Date.now();
    setPreAuthStage('checking');
    const tg = (window as any).Telegram?.WebApp;
    tg?.ready?.();
    tg?.expand?.();
    const data = extractInitData();
    setInitData(data);
    const validInit = isInitDataValid(data);
    const parsedUser = parseUserFromInitData(data);
    if (parsedUser) {
      setUser((prev) => mergeUser(prev, parsedUser));
    }
    if (!validInit) {
      await ensureMinDelay(startedAt);
      setPreAuthStage('error-auth');
      return;
    }
    setPreAuthStage('connecting');
    try {
      const { user } = await initSession(data);
      setUser((prev) => mergeUser(prev, { ...user, photo_url: (user as any)?.photo_url ?? prev?.photo_url ?? null }));
      await ensureMinDelay(startedAt);
      setPreAuthStage('done');
      setTimeout(() => setScreen('cover'), 300);
    } catch (err: any) {
      console.error('initSession failed', err);
      await ensureMinDelay(startedAt);
      const msg = err?.message?.toLowerCase?.() ?? '';
      if (msg.includes('initdata') || msg.includes('401') || msg.includes('403') || msg.includes('empty')) {
        setPreAuthStage('error-auth');
      } else if (msg.includes('fetch') || msg.includes('network') || msg.includes('timeout')) {
        setPreAuthStage('error-network');
      } else {
        setPreAuthStage('error-unknown');
      }
    }
  };

  useEffect(() => {
    if (screen === 'catalog') {
      void refreshCatalog();
      if (!stones.length) void refreshStones();
    }
    if (screen === 'custom' || screen === 'library') {
      if (!stones.length) void refreshStones();
    }
    if (screen === 'stone') {
      if (!themes.length) void refreshThemes();
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

  const refreshThemes = async () => {
    setThemesLoading(true);
    try {
      const { themes } = await getThemes(initData);
      setThemes(themes);
    } catch (err) {
      console.error('getThemes failed', err);
      setToast('Не удалось загрузить темы.');
    } finally {
      setThemesLoading(false);
    }
  };

  const handleBirthdateUpdate = async (birthdate: string, nextScreen?: Screen): Promise<void> => {
    try {
      const { user } = await updateBirthdate(initData, birthdate);
      setUser((prev) => mergeUser(prev, { ...user, photo_url: (user as any)?.photo_url ?? prev?.photo_url ?? null }));
      setToast('Дата рождения сохранена');
      if (nextScreen) setScreen(nextScreen);
    } catch (err) {
      console.error('updateBirthdate failed', err);
      setToast('Не удалось сохранить дату. Проверь подключение.');
      throw err;
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
      setOrderModal({
        title: 'Заказ принят',
        text: 'Наш менеджер скоро свяжется с вами.',
      });
    } catch (err) {
      console.error('custom request failed', err);
      setToast('Не удалось отправить, попробуйте ещё раз.');
    } finally {
      setRequestLoading(false);
    }
  };

  const handleProductOrder = async (product: Product) => {
    setRequestLoading(true);
    try {
      await submitCustomRequest(initData, {
        type: 'catalog',
        stones: product.stone_ids ?? product.stones ?? [],
        budget_from: product.price_min ?? product.price ?? null,
        budget_to: product.price_max ?? product.price ?? null,
        comment: `Каталог: ${product.name} (id ${product.id})`,
      });
      setOrderModal({
        title: 'Заказ принят',
        text: 'Наш менеджер скоро свяжется с вами.',
      });
    } catch (err) {
      console.error('catalog order failed', err);
      setToast('Не удалось отправить, попробуйте ещё раз.');
    } finally {
      setRequestLoading(false);
    }
  };

  const handleToggleFavorite = (product: Product) => {
    setFavoriteProducts((prev) => {
      if (prev.some((p) => p.id === product.id)) {
        const next = prev.filter((p) => p.id !== product.id);
        persistFavorites(next);
        return next;
      }
      const next = [...prev, product];
      persistFavorites(next);
      return next;
    });
  };

  const handleOpenCatalogWithStone = (stoneId: number) => {
    setCatalogFilters((prev) => ({ ...prev, stone_ids: [stoneId] }));
    setScreen('catalog');
  };

  const content = useMemo(() => {
    if (preAuthStage !== 'done') return null;
    if (screen === 'cover')
      return <Cover onStart={() => setScreen('main')} onCatalog={() => setScreen('catalog')} onNavigate={setScreen} />;
    if (screen === 'main') return <MainMenu user={user} onNavigate={setScreen} onBackToCover={() => setScreen('cover')} />;
    if (screen === 'birthdate')
      return <BirthdateForm user={user} onSubmit={(date) => handleBirthdateUpdate(date, 'stone')} onBack={() => setScreen('main')} />;
    if (screen === 'profile')
      return <Profile user={user} onSaveBirthdate={(date) => handleBirthdateUpdate(date, 'profile')} onBack={() => setScreen('main')} />;
    if (screen === 'stone')
      return (
        <StonePicker
          result={stoneResult}
          loading={pickerLoading}
          themes={themes}
          themesLoading={themesLoading}
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
          favorites={new Set(favoriteProducts.map((p) => p.id))}
          onToggleFavorite={handleToggleFavorite}
          onOrder={handleProductOrder}
          onBack={() => setScreen('main')}
          onCustomRequest={() => setScreen('custom')}
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
      return <Reviews onBack={() => setScreen('main')} />;
    if (screen === 'history')
      return <BrandStory onBack={() => setScreen('main')} />;
    if (screen === 'favorites')
      return (
        <Favorites
          products={favoriteProducts}
          onOrder={handleProductOrder}
          onToggleFavorite={handleToggleFavorite}
          onBack={() => setScreen('main')}
        />
      );
    return null;
  }, [
    preAuthStage,
    screen,
    user,
    stoneResult,
    pickerLoading,
    catalogFilters,
    products,
    stones,
    themes,
    catalogLoading,
    stonesLoading,
    themesLoading,
    requestLoading,
    favoriteProducts,
  ]);

  return (
    <div className="app-shell">
      {preAuthStage !== 'done' ? <PreAuth stage={preAuthStage} /> : null}
      {content}
      {orderModal ? (
        <ConfirmModal
          title={orderModal.title}
          text={orderModal.text}
          onClose={() => setOrderModal(null)}
        />
      ) : null}
      {toast ? <div className="toast">{toast}</div> : null}
    </div>
  );
}

export default App;
