"use client";

import { useState } from "react";
import { formatPhone, isValidPhone } from "@/lib/phone";

type Placement = "house" | "industrial" | "other";
type ModelPicked = "yes" | "no";
type Extras = "chimney" | "warm-floor" | "boiler" | "later";
type AreaId = "up-to-100" | "100-200" | "200-400" | "400-1500" | "1500+" | "custom";

const PLACEMENTS: { id: Placement; label: string; hint: string }[] = [
  { id: "house", label: "Загородный дом", hint: "Частное домовладение, коттедж" },
  { id: "industrial", label: "Производственное или складское помещение", hint: "Цех, склад, ангар" },
  { id: "other", label: "Другое", hint: "Квартира, офис, другое" },
];

const AREAS: { id: AreaId; label: string; hint?: string }[] = [
  { id: "up-to-100", label: "до 100 м²" },
  { id: "100-200", label: "100–200 м²" },
  { id: "200-400", label: "200–400 м²" },
  { id: "400-1500", label: "400–1500 м²" },
  { id: "1500+", label: "более 1500 м²" },
  { id: "custom", label: "Свой размер", hint: "введите площадь" },
];

const MODELS: { id: ModelPicked; label: string }[] = [
  { id: "yes", label: "Да, уже выбрал(а)" },
  { id: "no", label: "Нет, помогите выбрать" },
];

const EXTRAS: { id: Extras; label: string; hint: string }[] = [
  { id: "chimney", label: "Дымоход", hint: "котлу понадобится дымоход" },
  { id: "warm-floor", label: "Тёплый пол", hint: "отопление тёплыми полами" },
  { id: "boiler", label: "Бойлер", hint: "нужен бойлер для горячей воды" },
  { id: "later", label: "Решу позже", hint: "пока только котёл" },
];

export function BoilerWizard() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [placement, setPlacement] = useState<Placement | null>(null);
  const [area, setArea] = useState<AreaId | null>(null);
  const [customArea, setCustomArea] = useState("");
  const [modelPicked, setModelPicked] = useState<ModelPicked | null>(null);
  const [extras, setExtras] = useState<Extras | null>(null);
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  function reset() {
    setStep(1);
    setPlacement(null);
    setArea(null);
    setCustomArea("");
    setModelPicked(null);
    setExtras(null);
    setPhone("");
    setError("");
    setDone(false);
  }

  function openWizard() {
    reset();
    setOpen(true);
  }

  function close() {
    setOpen(false);
    reset();
  }

  const customAreaNumber = Number(customArea.replace(",", "."));
  const canNext =
    step === 1
      ? placement !== null
      : step === 2
      ? area !== null && (area !== "custom" || (Number.isFinite(customAreaNumber) && customAreaNumber > 0))
      : step === 3
      ? modelPicked !== null
      : step === 4
      ? extras !== null
      : true;

  function next() {
    if (step < 5) {
      setError("");
      setStep(step + 1);
    }
  }

  function back() {
    setError("");
    setStep(Math.max(1, step - 1));
  }

  function submit() {
    if (!isValidPhone(phone)) {
      setError("Телефон должен быть в формате +7-999-999-99-99");
      return;
    }
    setError("");
    setDone(true);
  }

  return (
    <>
      <button
        type="button"
        onClick={openWizard}
        aria-label="Подобрать котёл"
        className="fixed left-0 top-1/2 z-40 -translate-y-1/2 rounded-r-md bg-brand-red-800 px-2 py-8 text-sm font-medium uppercase tracking-[0.2em] text-white shadow-lg shadow-brand-red-900/30 transition-colors hover:bg-brand-red-700 [writing-mode:vertical-rl]"
      >
        Подобрать котёл
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <button
            type="button"
            aria-label="Закрыть"
            onClick={close}
            className="absolute inset-0 bg-graphite-950/70 backdrop-blur-sm"
          />
          <div className="relative w-full max-w-lg border border-graphite-700/10 bg-white shadow-2xl">
            {done ? (
              <div className="flex flex-col items-center px-8 py-14 text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-green-700 text-3xl text-white">
                  ✓
                </span>
                <h2 className="mt-6 font-display text-3xl font-semibold text-graphite-950">
                  Заявка отправлена
                </h2>
                <p className="mt-3 max-w-sm text-sm leading-relaxed text-graphite-600">
                  Наш консультант свяжется с вами в течение 15 минут и поможет подобрать
                  подходящий котёл.
                </p>
                <button
                  type="button"
                  onClick={close}
                  className="mt-8 bg-brand-red-800 px-8 py-3 text-sm font-medium uppercase tracking-[0.1em] text-white transition-colors hover:bg-brand-red-700"
                >
                  Закрыть
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-graphite-100 px-6 py-4">
                  <div>
                    <h2 className="font-display text-2xl font-semibold text-graphite-950">
                      Подбор котла
                    </h2>
                    <span className="mt-0.5 block text-xs uppercase tracking-[0.1em] text-graphite-400">
                      Шаг {step} из 5
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={close}
                    aria-label="Закрыть"
                    className="flex h-9 w-9 items-center justify-center text-2xl text-graphite-400 transition-colors hover:text-brand-red-700"
                  >
                    ×
                  </button>
                </div>

                <div className="flex gap-1.5 px-6 pt-4">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span
                      key={s}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        s <= step ? "bg-brand-red-700" : "bg-graphite-700/15"
                      }`}
                    />
                  ))}
                </div>

                <div className="px-6 py-6">
                  {step === 1 && (
                    <Step
                      question="Какое помещение вы хотите отапливать?"
                      options={PLACEMENTS.map((o) => ({ id: o.id, label: o.label, hint: o.hint }))}
                      selected={placement}
                      onSelect={(v) => setPlacement(v as Placement)}
                    />
                  )}

                  {step === 2 && (
                    <div>
                      <h3 className="font-display text-xl font-semibold text-graphite-950">
                        Какая площадь помещения?
                      </h3>
                      <div className="mt-4 grid grid-cols-2 gap-3">
                        {AREAS.map((option) => {
                          const selected = area === option.id;
                          return (
                            <button
                              key={option.id}
                              type="button"
                              onClick={() => setArea(option.id)}
                              className={`flex flex-col items-center justify-center gap-1 border px-4 py-4 text-sm transition-colors ${
                                selected
                                  ? "border-brand-red-700 bg-brand-red-700/5 text-brand-red-800"
                                  : "border-graphite-700/20 text-graphite-800 hover:border-graphite-700/40"
                              }`}
                            >
                              <span className="font-medium">{option.label}</span>
                              {option.hint && (
                                <span className="text-xs text-graphite-400">{option.hint}</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                      {area === "custom" && (
                        <div className="mt-4 flex items-center gap-2">
                          <input
                            autoFocus
                            inputMode="decimal"
                            placeholder="Например, 260"
                            value={customArea}
                            onChange={(e) => setCustomArea(e.target.value)}
                            className="flex-1 border border-graphite-700/20 px-3 py-3 text-sm outline-none focus:border-brand-red-700"
                          />
                          <span className="text-sm text-graphite-500">м²</span>
                        </div>
                      )}
                    </div>
                  )}

                  {step === 3 && (
                    <Step
                      question="Уже выбрали модель?"
                      options={MODELS.map((o) => ({ id: o.id, label: o.label }))}
                      selected={modelPicked}
                      onSelect={(v) => setModelPicked(v as ModelPicked)}
                    />
                  )}

                  {step === 4 && (
                    <Step
                      question="Что понадобится к котлу?"
                      options={EXTRAS.map((o) => ({ id: o.id, label: o.label, hint: o.hint }))}
                      selected={extras}
                      onSelect={(v) => setExtras(v as Extras)}
                    />
                  )}

                  {step === 5 && (
                    <div>
                      <h3 className="font-display text-xl font-semibold text-graphite-950">
                        Номер для связи с консультантом
                      </h3>
                      <p className="mt-1 text-sm text-graphite-500">
                        Оставьте номер — инженер перезвонит и поможет с выбором.
                      </p>
                      <input
                        autoFocus
                        inputMode="tel"
                        placeholder="+7-999-999-99-99"
                        maxLength={18}
                        value={phone}
                        onChange={(e) => setPhone(formatPhone(e.target.value))}
                        className="mt-4 w-full border border-graphite-700/20 px-3 py-3 text-sm outline-none focus:border-brand-red-700"
                      />
                      {error && <p className="mt-2 text-sm text-brand-red-700">{error}</p>}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-graphite-100 px-6 py-4">
                  <button
                    type="button"
                    onClick={back}
                    disabled={step === 1}
                    className="px-4 py-3 text-sm uppercase tracking-[0.1em] text-graphite-500 transition-colors hover:text-graphite-950 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Назад
                  </button>
                  {step < 5 ? (
                    <button
                      type="button"
                      onClick={next}
                      disabled={!canNext}
                      className="bg-brand-red-800 px-8 py-3 text-sm font-medium uppercase tracking-[0.1em] text-white transition-colors hover:bg-brand-red-700 disabled:cursor-not-allowed disabled:bg-graphite-300"
                    >
                      Далее
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={submit}
                      className="bg-brand-red-800 px-8 py-3 text-sm font-medium uppercase tracking-[0.1em] text-white transition-colors hover:bg-brand-red-700"
                    >
                      Отправить заявку
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function Step({
  question,
  options,
  selected,
  onSelect,
}: {
  question: string;
  options: { id: string; label: string; hint?: string }[];
  selected: string | null;
  onSelect: (value: string) => void;
}) {
  return (
    <div>
      <h3 className="font-display text-xl font-semibold text-graphite-950">{question}</h3>
      <div className="mt-4 flex flex-col gap-3">
        {options.map((option) => {
          const active = selected === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelect(option.id)}
              className={`flex flex-col items-start border px-4 py-4 text-left transition-colors ${
                active
                  ? "border-brand-red-700 bg-brand-red-700/5"
                  : "border-graphite-700/20 hover:border-graphite-700/40"
              }`}
            >
              <span className={`text-sm font-medium ${active ? "text-brand-red-800" : "text-graphite-950"}`}>
                {option.label}
              </span>
              {option.hint && <span className="mt-0.5 text-xs text-graphite-400">{option.hint}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}