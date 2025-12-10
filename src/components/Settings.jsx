import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Save, UploadCloud, DownloadCloud, CheckCircle, AlertCircle, Trash2, X } from 'lucide-react';

const Settings = () => {
    const { syncSettings, updateSyncSettings, backupData, restoreData, clearData } = useApp();
    const [backupUrl, setBackupUrl] = useState(syncSettings.backupUrl);
    const [restoreUrl, setRestoreUrl] = useState(syncSettings.restoreUrl);
    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);
    const [showGuide, setShowGuide] = useState(false);

    const handleSave = () => {
        updateSyncSettings({ backupUrl, restoreUrl });
        setStatus({ type: 'success', message: 'Einstellungen erfolgreich gespeichert!' });
        setTimeout(() => setStatus({ type: '', message: '' }), 3000);
    };

    const handleBackup = async () => {
        setLoading(true);
        setStatus({ type: '', message: '' });
        try {
            await backupData();
            setStatus({ type: 'success', message: 'Sicherung erfolgreich abgeschlossen!' });
        } catch (error) {
            setStatus({ type: 'error', message: 'Sicherung fehlgeschlagen: ' + error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = async () => {
        if (!window.confirm("Dies überschreibt alle aktuellen Daten mit den Daten aus der Cloud. Bist du sicher?")) return;

        setLoading(true);
        setStatus({ type: '', message: '' });
        try {
            await restoreData();
            setStatus({ type: 'success', message: 'Wiederherstellung erfolgreich abgeschlossen!' });
        } catch (error) {
            setStatus({ type: 'error', message: 'Wiederherstellung fehlgeschlagen: ' + error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        if (window.confirm("Bist du sicher, dass du ALLE Daten löschen möchtest? Dies kann nicht rückgängig gemacht werden.")) {
            if (window.confirm("Wirklich sicher? Dies wird alles löschen.")) {
                clearData();
                setStatus({ type: 'success', message: 'Alle Daten wurden zurückgesetzt.' });
            }
        }
    };

    return (
        <div className="p-4 max-w-lg mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Einstellungen</h2>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-lg text-gray-700 dark:text-gray-200">OneDrive Synchronisation</h3>
                    <button onClick={() => setShowGuide(true)} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                        Einrichtungshilfe
                    </button>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Gib unten die Power Automate Webhook-URLs ein, um die Cloud-Synchronisation zu aktivieren.
                </p>

                {showGuide && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setShowGuide(false)}>
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto space-y-4 animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-white">Einrichtungsanleitung</h3>
                                <button onClick={() => setShowGuide(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="space-y-4 text-sm text-gray-600 dark:text-gray-300">
                                <p>Um die Synchronisation zu aktivieren, musst du zwei Power Automate Flows erstellen:</p>

                                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                    <h4 className="font-bold text-gray-800 dark:text-white mb-2">1. Sicherungs-Flow (Daten speichern)</h4>
                                    <ol className="list-decimal list-inside space-y-1">
                                        <li>Erstelle einen Flow mit Trigger: <strong>When a HTTP request is received</strong>.</li>
                                        <li>Setze Methode auf <strong>POST</strong>.</li>
                                        <li>Füge Aktion hinzu: <strong>Create file</strong> (OneDrive for Business).</li>
                                        <li>Setze Dateiname auf <code>classswipe_backup.json</code>.</li>
                                        <li>Setze Dateiinhalt auf den <strong>Body</strong> vom Trigger.</li>
                                        <li>Speichere und kopiere die <strong>HTTP POST URL</strong>.</li>
                                        <li>Füge sie unten in das Feld <strong>Backup URL</strong> ein.</li>
                                    </ol>
                                </div>

                                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                    <h4 className="font-bold text-gray-800 dark:text-white mb-2">2. Wiederherstellungs-Flow (Daten laden)</h4>
                                    <ol className="list-decimal list-inside space-y-1">
                                        <li>Erstelle einen Flow mit Trigger: <strong>When a HTTP request is received</strong>.</li>
                                        <li>Setze Methode auf <strong>GET</strong>.</li>
                                        <li>Füge Aktion hinzu: <strong>Get file content</strong> (OneDrive for Business).</li>
                                        <li>Wähle die Datei <code>classswipe_backup.json</code> aus.</li>
                                        <li>Füge Aktion hinzu: <strong>Response</strong>.</li>
                                        <li>Setze Body auf den <strong>File Content</strong> vom vorherigen Schritt.</li>
                                        <li>Speichere und kopiere die <strong>HTTP GET URL</strong>.</li>
                                        <li>Füge sie unten in das Feld <strong>Restore URL</strong> ein.</li>
                                    </ol>
                                </div>
                            </div>
                            <button onClick={() => setShowGuide(false)} className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700">
                                Verstanden
                            </button>
                        </div>
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Backup URL (POST)</label>
                        <input
                            type="text"
                            value={backupUrl}
                            onChange={(e) => setBackupUrl(e.target.value)}
                            placeholder="https://prod-..."
                            className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Restore URL (GET)</label>
                        <input
                            type="text"
                            value={restoreUrl}
                            onChange={(e) => setRestoreUrl(e.target.value)}
                            placeholder="https://prod-..."
                            className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        />
                    </div>
                </div>

                <button
                    onClick={handleSave}
                    className="mt-6 w-full bg-gray-900 dark:bg-gray-700 text-white py-3 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                >
                    <Save size={20} />
                    Einstellungen speichern
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
                <h3 className="font-semibold text-lg mb-4 text-gray-700 dark:text-gray-200">Verbindung testen</h3>

                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={handleBackup}
                        disabled={loading || !backupUrl}
                        className={`p-4 rounded-lg border flex flex-col items-center justify-center gap-2 transition-all ${loading || !backupUrl
                            ? 'bg-gray-50 dark:bg-gray-900 text-gray-400 dark:text-gray-600 border-gray-100 dark:border-gray-800'
                            : 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/40'
                            }`}
                    >
                        <UploadCloud size={24} />
                        <span className="font-medium">Jetzt sichern</span>
                    </button>

                    <button
                        onClick={handleRestore}
                        disabled={loading || !restoreUrl}
                        className={`p-4 rounded-lg border flex flex-col items-center justify-center gap-2 transition-all ${loading || !restoreUrl
                            ? 'bg-gray-50 dark:bg-gray-900 text-gray-400 dark:text-gray-600 border-gray-100 dark:border-gray-800'
                            : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-100 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/40'
                            }`}
                    >
                        <DownloadCloud size={24} />
                        <span className="font-medium">Jetzt wiederherstellen</span>
                    </button>
                </div>

                {status.message && (
                    <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${status.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                        }`}>
                        {status.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                        <span className="text-sm font-medium">{status.message}</span>
                    </div>
                )}
            </div>



            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-red-100 dark:border-red-900/30">
                <h3 className="font-semibold text-lg mb-4 text-red-600 dark:text-red-400">Gefahrenzone</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Lösche unwiderruflich alle Daten von diesem Gerät. Dies kann nicht rückgängig gemacht werden.
                </p>
                <button
                    onClick={handleReset}
                    className="w-full bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/30 py-3 rounded-lg font-medium hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center gap-2"
                >
                    <Trash2 size={20} />
                    Alle Daten zurücksetzen
                </button>
            </div>
        </div>
    );
};

export default Settings;
