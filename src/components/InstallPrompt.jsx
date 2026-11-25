import { useEffect, useState } from 'react'
import { Download, ExternalLink, MoreVertical, PlusSquare, Share, X } from 'lucide-react'

export default function InstallPrompt({ compact = false }) {
  const [promptEvent, setPromptEvent] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  const ua = navigator.userAgent || ''
  const isIos = /iphone|ipad|ipod/i.test(ua)
  // Messenger, Instagram, Facebook, TikTok, Snapchat in-app böngészők felismerése
  const isInApp = /FBAN|FBAV|Instagram|Messenger|TikTok|Snapchat/i.test(ua)

  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true
    setIsStandalone(standalone)

    const onBeforeInstall = (e) => {
      e.preventDefault()
      setPromptEvent(e)
    }
    const onInstalled = () => {
      setPromptEvent(null)
      setIsStandalone(true)
      setShowModal(false)
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  // Ha már telepített appként fut, egyáltalán ne jelenjen meg
  if (isStandalone) return null

  const handleInstall = async () => {
    if (promptEvent && !isInApp) {
      promptEvent.prompt()
      const { outcome } = await promptEvent.userChoice
      if (outcome === 'accepted') setPromptEvent(null)
      return
    }
    setShowModal(true)
  }

  return (
    <>
      {compact ? (
        <button
          type="button"
          onClick={handleInstall}
          aria-label="Alkalmazás telepítése"
          className="flex items-center gap-1 rounded-full border border-gold/40 bg-gold/15 px-2.5 py-1 text-xs font-bold text-gold active:scale-95"
        >
          <Download size={13} /> App
        </button>
      ) : (
        <button
          type="button"
          onClick={handleInstall}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-paper/15 bg-paper/10 py-3 text-xs font-bold text-paper active:scale-95"
        >
          <Download size={15} className="text-gold" /> Alkalmazás telepítése a telefonra
        </button>
      )}

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 p-0 sm:items-center sm:p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md space-y-4 rounded-t-3xl bg-paper p-6 pb-[calc(2rem+env(safe-area-inset-bottom))] text-ink sm:rounded-3xl"
          >
            <div className="flex items-center justify-between border-b border-ink/10 pb-3">
              <h3 className="font-display text-xl font-bold">Kuponfüzet telepítése</h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-full bg-ink/10 p-1.5 text-ink/70"
              >
                <X size={18} />
              </button>
            </div>

            {isInApp ? (
              <div className="space-y-2.5 text-sm leading-relaxed text-ink/85">
                <p className="font-bold text-berry">
                  Most egy alkalmazáson belüli (pl. Messenger / Instagram) böngészőben vagy!
                </p>
                <p>
                  Ezekből sajnos nem lehet főképernyőre rakni az appot. Nyisd meg a linket rendes böngészőben:
                </p>
                <ol className="list-decimal space-y-1.5 pl-5 text-xs font-semibold">
                  <li>
                    Koppints a sarokban lévő <MoreVertical size={14} className="inline text-berry" /> vagy{' '}
                    <ExternalLink size={14} className="inline text-berry" /> ikonra.
                  </li>
                  <li>
                    Válaszd a <strong>Megnyitás külső böngészőben / Safariban / Chrome-ban</strong> opciót.
                  </li>
                  <li>Utána ott már 1 koppintással főképernyőre rakhatod!</li>
                </ol>
              </div>
            ) : isIos ? (
              <div className="space-y-2.5 text-sm leading-relaxed text-ink/85">
                <p className="font-bold text-berry">Telepítés iPhone-on (Safariban):</p>
                <ol className="list-decimal space-y-2 pl-5 text-xs font-semibold">
                  <li>
                    Koppints alul a <Share size={15} className="inline text-berry" /> <strong>Megosztás</strong> ikonra.
                  </li>
                  <li>
                    Görgess le, és válaszd a <PlusSquare size={15} className="inline text-berry" />{' '}
                    <strong>Hozzáadás a főképernyőhöz</strong> gombot.
                  </li>
                  <li>Koppints jobb felül a <strong>Hozzáadás</strong> gombra.</li>
                </ol>
              </div>
            ) : (
              <div className="space-y-2.5 text-sm leading-relaxed text-ink/85">
                <p className="font-bold text-berry">Telepítés Androidon / Chrome-ban:</p>
                <ol className="list-decimal space-y-2 pl-5 text-xs font-semibold">
                  <li>
                    Koppints a jobb felső <MoreVertical size={15} className="inline text-berry" /> <strong>menü</strong> ikonra.
                  </li>
                  <li>
                    Válaszd az <strong>Alkalmazás telepítése</strong> vagy <strong>Hozzáadás a kezdőképernyőhöz</strong> opciót.
                  </li>
                </ol>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="w-full rounded-full bg-berry py-3 text-sm font-bold text-paper active:scale-95"
            >
              Értem
            </button>
          </div>
        </div>
      )}
    </>
  )
}