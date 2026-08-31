import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function OrganizationSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Pengaturan Organisasi</h1>
        <p className="text-sm text-slate-500">Kelola informasi klinik utama dan modul yang aktif.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profil Klinik</CardTitle>
            <CardDescription>Informasi ini akan digunakan secara global.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="orgName">Nama Klinik</Label>
              <Input id="orgName" defaultValue="Klinik Gigi Senyum Sehat" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug</Label>
              <Input id="slug" defaultValue="senyum-sehat" disabled className="bg-slate-50 text-slate-500" />
              <p className="text-xs text-slate-400">Slug tidak dapat diubah setelah dibuat.</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button>Simpan Profil</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Modul Aktif</CardTitle>
            <CardDescription>Aktifkan atau nonaktifkan fitur untuk organisasi Anda.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">GROW (Website Pasien)</Label>
                <p className="text-sm text-slate-500">Website profil klinik dan manajemen CMS.</p>
              </div>
              {/* Fake Toggle Switch UI for Mockup */}
              <div className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-sky-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white">
                 <span className="pointer-events-none inline-block h-5 w-5 translate-x-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out" />
              </div>
            </div>

             <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">CONNECT (Booking Online)</Label>
                <p className="text-sm text-slate-500">Sistem booking real-time & WhatsApp otomatis.</p>
              </div>
              <div className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-sky-600 transition-colors">
                 <span className="pointer-events-none inline-block h-5 w-5 translate-x-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out" />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium text-slate-400">OPERATE (Operasional)</Label>
                <p className="text-sm text-slate-400">Shift, inventaris, dan persetujuan (Phase 2).</p>
              </div>
              <div className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-slate-200 transition-colors">
                 <span className="pointer-events-none inline-block h-5 w-5 translate-x-0 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out" />
              </div>
            </div>
            
             <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium text-slate-400">INTELLIGENCE (Analitik)</Label>
                <p className="text-sm text-slate-400">Dashboard lengkap & laporan (Phase 2).</p>
              </div>
              <div className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-slate-200 transition-colors">
                 <span className="pointer-events-none inline-block h-5 w-5 translate-x-0 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}