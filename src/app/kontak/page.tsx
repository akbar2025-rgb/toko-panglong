"use client";

import { useId, useState, type FormEvent } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Dialog } from "@/components/dialog";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { useToast } from "@/components/toast";
import { formatRupiah } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { Contact, ContactInput, ContactType } from "@/lib/types";

function ContactForm({
  contact,
  initialType,
  onSubmit,
  onCancel,
}: {
  contact: Contact | null;
  initialType: ContactType;
  onSubmit: (input: ContactInput) => { ok: boolean; message?: string };
  onCancel: () => void;
}) {
  const baseId = useId();
  const [type, setType] = useState<ContactType>(
    contact?.type ?? initialType,
  );
  const [name, setName] = useState(contact?.name ?? "");
  const [phone, setPhone] = useState(contact?.phone ?? "");
  const [address, setAddress] = useState(contact?.address ?? "");
  const [note, setNote] = useState(contact?.note ?? "");
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (name.trim().length < 2) {
      setError("Nama kontak minimal dua karakter.");
      return;
    }

    const result = onSubmit({
      type,
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      note: note.trim(),
    });

    if (!result.ok) {
      setError(result.message ?? "Kontak belum dapat disimpan.");
    }
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-4">
      {error ? (
        <div
          role="alert"
          className="rounded-lg border border-danger/30 bg-danger-soft px-3 py-2.5 text-sm font-medium text-danger"
        >
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor={`${baseId}-name`} className="field-label">
            Nama
          </label>
          <input
            id={`${baseId}-name`}
            autoFocus
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="field"
            placeholder="Nama pelanggan atau pemasok"
            aria-invalid={Boolean(error)}
          />
        </div>
        <div>
          <label htmlFor={`${baseId}-type`} className="field-label">
            Jenis kontak
          </label>
          <select
            id={`${baseId}-type`}
            value={type}
            onChange={(event) =>
              setType(event.target.value as ContactType)
            }
            className="field"
          >
            <option value="pelanggan">Pelanggan</option>
            <option value="pemasok">Pemasok</option>
          </select>
        </div>
        <div>
          <label htmlFor={`${baseId}-phone`} className="field-label">
            Nomor telepon
          </label>
          <input
            id={`${baseId}-phone`}
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className="field font-mono"
            placeholder="Nomor telepon, boleh kosong"
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor={`${baseId}-address`} className="field-label">
            Alamat
          </label>
          <textarea
            id={`${baseId}-address`}
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            className="field min-h-20 resize-y"
            rows={2}
            placeholder="Alamat, boleh kosong"
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor={`${baseId}-note`} className="field-label">
            Catatan
          </label>
          <textarea
            id={`${baseId}-note`}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            className="field min-h-20 resize-y"
            rows={2}
            placeholder="Contoh: tempo pembayaran atau kebiasaan pengiriman."
          />
        </div>
      </div>

      <div className="flex flex-col-reverse gap-2 border-t border-line pt-4 sm:flex-row sm:justify-end">
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          Batal
        </button>
        <button type="submit" className="btn btn-primary">
          Simpan kontak
        </button>
      </div>
    </form>
  );
}

export default function ContactsPage() {
  const {
    data,
    addContact,
    updateContact,
    deleteContact,
  } = useStore();
  const { showToast } = useToast();
  const [activeType, setActiveType] = useState<ContactType>("pelanggan");
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Contact | null>(null);
  const [deleting, setDeleting] = useState<Contact | null>(null);

  const contacts = data.contacts.filter(
    (contact) => contact.type === activeType,
  );
  const filteredContacts = contacts.filter((contact) => {
    const query = search.trim().toLowerCase();
    return (
      !query ||
      contact.name.toLowerCase().includes(query) ||
      contact.phone.toLowerCase().includes(query) ||
      contact.address.toLowerCase().includes(query)
    );
  });

  function transactionStats(contact: Contact) {
    if (contact.type === "pelanggan") {
      const sales = data.sales.filter(
        (sale) => sale.customerId === contact.id,
      );
      return {
        count: sales.length,
        total: sales.reduce((sum, sale) => sum + sale.total, 0),
      };
    }

    const purchases = data.purchases.filter(
      (purchase) => purchase.supplierId === contact.id,
    );
    return {
      count: purchases.length,
      total: purchases.reduce((sum, purchase) => sum + purchase.total, 0),
    };
  }

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(contact: Contact) {
    setEditing(contact);
    setFormOpen(true);
  }

  return (
    <>
      <PageHeader
        title="Kontak"
        description="Simpan pelanggan dan pemasok agar nota memakai nama yang konsisten. Kontak awal di aplikasi ini adalah data contoh."
        actions={
          <button type="button" onClick={openCreate} className="btn btn-primary">
            Tambah kontak
          </button>
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveType("pelanggan")}
          aria-pressed={activeType === "pelanggan"}
          className={`btn ${
            activeType === "pelanggan" ? "btn-dark" : "btn-secondary"
          }`}
        >
          Pelanggan
          <span className="font-mono text-xs">
            {data.contacts.filter((contact) => contact.type === "pelanggan").length}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveType("pemasok")}
          aria-pressed={activeType === "pemasok"}
          className={`btn ${
            activeType === "pemasok" ? "btn-dark" : "btn-secondary"
          }`}
        >
          Pemasok
          <span className="font-mono text-xs">
            {data.contacts.filter((contact) => contact.type === "pemasok").length}
          </span>
        </button>
      </div>

      <section className="panel">
        <div className="border-b border-line p-4">
          <label htmlFor="contacts-search" className="sr-only">
            Cari kontak
          </label>
          <input
            id="contacts-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="field sm:max-w-md"
            placeholder={`Cari ${activeType === "pelanggan" ? "pelanggan" : "pemasok"}`}
          />
          <p className="mt-3 text-xs text-muted" aria-live="polite">
            {filteredContacts.length} kontak ditampilkan.
          </p>
        </div>

        {contacts.length === 0 ? (
          <EmptyState
            title={
              activeType === "pelanggan"
                ? "Belum ada pelanggan"
                : "Belum ada pemasok"
            }
            description="Tambahkan kontak agar nota tersimpan dengan nama yang rapi."
            action={
              <button
                type="button"
                onClick={openCreate}
                className="btn btn-primary"
              >
                Tambah kontak
              </button>
            }
          />
        ) : filteredContacts.length === 0 ? (
          <EmptyState
            title="Tidak ada kontak yang cocok"
            description="Ubah kata kunci pencarian untuk melihat kontak lain."
          />
        ) : (
          <>
            <div className="hidden md:block">
              <table className="table-base">
                <thead>
                  <tr>
                    <th scope="col">Nama</th>
                    <th scope="col">Telepon</th>
                    <th scope="col">Alamat</th>
                    <th scope="col">Transaksi</th>
                    <th scope="col">
                      <span className="sr-only">Tindakan</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContacts.map((contact) => {
                    const stats = transactionStats(contact);

                    return (
                      <tr key={contact.id}>
                        <td>
                          <p className="font-semibold text-ink">
                            {contact.name}
                          </p>
                          {contact.note ? (
                            <p className="mt-0.5 max-w-56 truncate text-xs text-muted">
                              {contact.note}
                            </p>
                          ) : null}
                        </td>
                        <td className="font-mono text-xs text-ink">
                          {contact.phone || (
                            <span className="text-muted">Belum diisi</span>
                          )}
                        </td>
                        <td className="max-w-56 text-sm text-muted">
                          <p className="truncate">
                            {contact.address || "Belum diisi"}
                          </p>
                        </td>
                        <td>
                          <p className="font-mono text-sm tabular-nums text-ink">
                            {stats.count} nota
                          </p>
                          <p className="mt-0.5 font-mono text-xs text-muted">
                            {formatRupiah(stats.total)}
                          </p>
                        </td>
                        <td>
                          <div className="flex justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => openEdit(contact)}
                              className="inline-flex min-h-11 items-center rounded-lg px-2.5 text-xs font-semibold text-clay hover:bg-clay-soft"
                            >
                              Ubah
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleting(contact)}
                              className="inline-flex min-h-11 items-center rounded-lg px-2.5 text-xs font-semibold text-danger hover:bg-danger-soft"
                            >
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <ul className="md:hidden" aria-label="Daftar kontak">
              {filteredContacts.map((contact) => {
                const stats = transactionStats(contact);

                return (
                  <li key={contact.id} className="mobile-data-card">
                    <p className="font-semibold text-ink">{contact.name}</p>
                    <p className="mt-1 font-mono text-xs text-muted">
                      {contact.phone || "Telepon belum diisi"}
                    </p>
                    <p className="mt-2 text-sm text-muted">
                      {contact.address || "Alamat belum diisi"}
                    </p>
                    <p className="mt-2 font-mono text-xs text-muted">
                      {stats.count} nota / {formatRupiah(stats.total)}
                    </p>
                    <div className="mt-3 flex gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(contact)}
                        className="inline-flex min-h-11 items-center rounded-lg px-2.5 text-xs font-semibold text-clay hover:bg-clay-soft"
                      >
                        Ubah
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleting(contact)}
                        className="inline-flex min-h-11 items-center rounded-lg px-2.5 text-xs font-semibold text-danger hover:bg-danger-soft"
                      >
                        Hapus
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </section>

      <Dialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? "Ubah kontak" : "Tambah kontak"}
      >
        {formOpen ? (
          <ContactForm
            key={editing?.id ?? "kontak-baru"}
            contact={editing}
            initialType={activeType}
            onCancel={() => setFormOpen(false)}
            onSubmit={(input) => {
              const result = editing
                ? updateContact(editing.id, input)
                : addContact(input);

              if (result.ok) {
                showToast(
                  editing ? "Perubahan kontak tersimpan." : "Kontak ditambahkan.",
                );
                setActiveType(input.type);
                setFormOpen(false);
              }

              return result;
            }}
          />
        ) : null}
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={() => {
          if (!deleting) {
            return;
          }

          deleteContact(deleting.id);
          showToast("Kontak dihapus. Nota lama tetap menyimpan nama kontak.");
        }}
        title="Hapus kontak?"
        description={
          deleting
            ? `${deleting.name} akan dihapus dari daftar kontak. Nota lama tetap menyimpan nama ini.`
            : ""
        }
        confirmLabel="Hapus kontak"
        tone="danger"
      />
    </>
  );
}
