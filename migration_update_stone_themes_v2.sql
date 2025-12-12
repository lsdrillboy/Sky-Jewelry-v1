-- Миграция тем камней к новой матрице (10 тем).
-- Новый набор кодов: energy_resource, inner_strength, clarity_focus, intuition_path,
-- confidence_charisma, balance_harmony, healing_restore, luck_flow, energy_protection, selflove.
-- Карта соответствий со старыми темами: money -> luck_flow, love -> selflove,
-- protection -> energy_protection, mind -> clarity_focus, transformation -> intuition_path.

with mapped as (
  select
    id,
    (
      select array_agg(distinct new_code)
      from unnest(coalesce(themes, '{}')) as t(old_code)
      cross join lateral (
        select case old_code
          when 'money' then 'luck_flow'
          when 'love' then 'selflove'
          when 'protection' then 'energy_protection'
          when 'mind' then 'clarity_focus'
          when 'transformation' then 'intuition_path'
          else old_code
        end as new_code
      ) m
    ) as new_themes
  from public.stones
)
update public.stones s
set themes = coalesce(m.new_themes, themes)
from mapped m
where s.id = m.id;

-- При необходимости вручную назначьте новые коды для камней, которые имели произвольные/нестандартные темы.
