import { ShieldCheck, Info, X } from 'lucide-react'

export default function InfoModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 p-0 sm:items-center sm:p-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85vh] w-full max-w-md space-y-5 overflow-y-auto rounded-t-3xl bg-paper p-6 pb-[calc(2rem+env(safe-area-inset-bottom))] text-ink sm:rounded-3xl"
      >
        <div className="flex items-center justify-between border-b border-ink/10 pb-3">
          <h2 className="font-display text-xl font-bold">Adatkezelés és tudnivalók</h2>
          <button onClick={onClose} aria-label="Bezárás" className="rounded-full bg-ink/10 p-1.5 text-ink/70">
            <X size={18} />
          </button>
        </div>

        <section className="space-y-2 text-xs leading-relaxed text-ink/85">
          <h3 className="flex items-center gap-1.5 text-sm font-bold text-ink">
            <ShieldCheck size={16} className="text-berry" /> Adatvédelmi tájékoztató
          </h3>
          <p>
            A <strong>Kuponfüzet</strong> egy ingyenes, hirdetésmentes webalkalmazás. A regisztráció során megadott e-mail-címet, valamint a füzetben létrehozott kuponokat, szöveges bejegyzéseket és feltöltött közös fotókat kizárólag az alkalmazás működtetéséhez tároljuk (Supabase felhőalapú adatbázisban és tárhelyen).
          </p>
          <p>
            <strong>Adatbiztonság:</strong> A füzeted tartalmához kizárólag te és az általad meghívott partnered fértek hozzá. Adataidat harmadik félnek nem adjuk át, és marketingcélra nem használjuk fel.
          </p>
          <p>
            <strong>Adatok törlése:</strong> Fiókodat, kuponfüzetedet és minden feltöltött fényképedet bármikor, egyetlen kattintással véglegesen törölheted az alkalmazáson belül (a <em>Kezdjük el!</em> képernyőn vagy az <em>Admin</em> fül alján).
          </p>
        </section>

        <section className="space-y-2 border-t border-ink/10 pt-4 text-xs leading-relaxed text-ink/85">
          <h3 className="flex items-center gap-1.5 text-sm font-bold text-ink">
            <Info size={16} className="text-berry" /> Hasznos tudnivalók
          </h3>
          <ul className="list-disc space-y-1.5 pl-4">
            <li>
              <strong>Jelszó megjegyzése:</strong> A regisztráció e-mailes visszaigazolás nélkül, azonnal megtörténik. Érdemes elmenteni a jelszavadat a böngészőben, mert automatikus jelszó-emlékeztető jelenleg nem működik.
            </li>
            <li>
              <strong>E-mail értesítés aktiválása:</strong> Ha füzetkészítőként beállítasz egy értesítési e-mail-címet az Admin fülön, az <em>első</em> kuponbeváltás után kapsz egy egyszeri megerősítő levelet (érdemes a Spam mappát is megnézni) — abban kattints az aktiváló gombra, utána minden értesítés automatikusan érkezik.
            </li>
            <li>
              <strong>Használat telefonos appként:</strong> Androidon a telepítő gombbal, iPhone-on pedig Safariban a <em>Megosztás → Hozzáadás a főképernyőhöz</em> menüponttal teljes képernyős alkalmazásként is kirakhatod a telefonodra.
            </li>
          </ul>
        </section>

        <button
          onClick={onClose}
          className="w-full rounded-full bg-berry py-3 text-sm font-bold text-paper active:scale-95"
        >
          Rendben, megértettem
        </button>
      </div>
    </div>
  )
}