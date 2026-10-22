"use client";

import { useState, type FormEvent } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { PageHeader } from "@/components/page-header";
import { useToast } from "@/components/toast";
import { formatNumber } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { Settings } from "@/lib/types";

function StoreProfileForm({
  settings,
  onSave,
}: {
  settings: Settings;
  onSave: (next: Settings) => void;
}) {
  const [storeName, setStoreName] = useState(settings.storeName);
  const [address, setAddress] = useState(settings.address);
  const [phone, setPhone] = useState(settings.phone);
  const [receiptNote, setReceiptNote] = useState(settings.receiptNote);
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (storeName.trim().length < 2) {
      setError("Nama usaha minimal dua karakter.");
      return;
    }

    onSave({
      storeName: storeName.trim(),
      address: address.trim(),
      phone: phone.trim(),
      receiptNote: receiptNote.trim(),
    });
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-4 p-5">
      {error ? (
        <div
          role="alert"
          className="rounded-lg border border-danger/30 bg-danger-soft px-3 py-2.5 text-sm font-medium text-danger"
        >
          {error}
        </div>
      ) : null}

      <div>
        <label htmlFor="settings-store-name" className="field-label">
          Nama usaha
        </label>
        <input
          id="settings-store-name"
          type="text"
          value={storeName}
          onChange={(event) => setStoreName(event.target.value)}
          className="field"
          placeholder="Nama toko"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="settings-phone" className="field-label">
            Telepon
          </label>
          <input
            id="settings-phone"
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className="field font-mono"
            placeholder="Nomor telepon toko"
          />
        </div>
        <div>
          <label htmlFor="settings-address" className="field-label">
            Alamat
          </label>
          <input
            id="settings-address"
            type="text"
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            className="field"
            placeholder="Alamat toko"
          />
        </div>
      </div>

      <div>
        <label htmlFor="settings-receipt-note" className="field-label">
          Catatan pada nota
        </label>
        <textarea
          id="settings-receipt-note"
          value={receiptNote}
          onChange={(event) => setReceiptNote(event.target.value)}
          className="field min-h-24 resize-y"
          rows={3}
          placeholder="Catatan yang tampil di detail nota penjualan."
        />
        <p className="field-help">
          Catatan ini tidak dicetak otomatis, tetapi tampil di detail nota.
        </p>
      </div>

      <div className="flex justify-end border-t border-line pt-4">
        <button type="submit" className="btn btn-primary">
          Simpan profil
        </button>
      </div>
    </form>
  );
}

export default function SettingsPage() {
  const { data, updateSettings, resetData } = useStore();
  const { showToast } = useToast();
  const [resetOpen, setResetOpen] = useState(false);

  return (
    <>
      <PageHeader
        title="Pengaturan"
        description="Atur identitas usaha dan kelola data yang tersimpan di browser ini."
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]">
        <section className="panel">
          <div className="panel-head">
            <div>
              <h2 className="panel-title">Profil usaha</h2>
              <p className="mt-1 text-xs text-muted">
                Nama dan alamat dipakai untuk identitas toko di aplikasi.
              </p>
            </div>
          </div>
          <StoreProfileForm
            key={`${data.settings.storeName}-${data.settings.address}-${data.settings.phone}-${data.settings.receiptNote}`}
            settings={data.settings}
            onSave={(next) => {
              updateSettings(next);
              showToast("Profil usaha tersimpan.");
            }}
          />
        </section>

        <div className="space-y-5">
          <section className="panel">
            <div className="panel-head">
              <div>
                <h2 className="panel-title">Data di perangkat ini</h2>
                <p className="mt-1 text-xs text-muted">
                  Data disimpan di localStorage browser.
                </p>
              </div>
            </div>
            <dl className="px-5 py-4">
              <div className="summary-row">
                <dt>Barang</dt>
                <dd>{formatNumber(data.products.length)}</dd>
              </div>
              <div className="summary-row">
                <dt>Kontak</dt>
                <dd>{formatNumber(data.contacts.length)}</dd>
              </div>
              <div className="summary-row">
                <dt>Nota penjualan</dt>
                <dd>{formatNumber(data.sales.length)}</dd>
              </div>
              <div className="summary-row">
                <dt>Nota pembelian</dt>
                <dd>{formatNumber(data.purchases.length)}</dd>
              </div>
            </dl>
            <div className="border-t border-line p-5">
              <p className="text-xs leading-relaxed text-muted">
                Data tidak tersinkron ke perangkat lain. Membersihkan data
                browser juga akan menghapus catatan toko.
              </p>
            </div>
          </section>

          <section className="panel">
            <div className="panel-head">
              <div>
                <h2 className="panel-title">Data contoh</h2>
                <p className="mt-1 text-xs text-muted">
                  Ganti data contoh dengan catatan nyata saat mulai dipakai.
                </p>
              </div>
            </div>
            <div className="p-5">
              <p className="text-sm leading-relaxed text-muted">
                Reset akan mengganti seluruh barang, kontak, penjualan, dan
                pembelian dengan data contoh baru. Tindakan ini tidak bisa
                dibatalkan.
              </p>
              <button
                type="button"
                onClick={() => setResetOpen(true)}
                className="btn btn-secondary mt-4"
              >
                Reset ke data contoh
              </button>
            </div>
          </section>
        </div>
      </div>

      <ConfirmDialog
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        onConfirm={() => {
          resetData();
          showToast("Data contoh baru sudah dimuat.");
        }}
        title="Reset semua data?"
        description="Semua barang, kontak, penjualan, dan pembelian yang tersimpan akan diganti dengan data contoh baru."
        confirmLabel="Reset data"
        tone="danger"
      />
    </>
  );
}
