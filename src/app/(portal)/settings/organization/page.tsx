import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function OrganizationSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Pengaturan Organisasi</h1>
        <p className="text-sm text-muted-foreground">Kelola informasi klinik utama dan modul yang aktif.</p>
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
              <Input id="orgName" defaultValue="Klinik Gigi Senyum Sehat" className="bg-card border-border" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug</Label>
              <Input id="slug" defaultValue="senyum-sehat" disabled className="bg-muted text-muted-foreground border-border" />
              <p className="text-xs text-muted-foreground">Slug tidak dapat diubah setelah dibuat.</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">Simpan Profil</Button>
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
                <Label className="text-base font-medium text-foreground">GROW (Website Pasien)</Label>
                <p className="text-sm text-muted-foreground">Website profil klinik dan manajemen CMS.</p>
              </div>
              <div className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-primary transition-colors">
                 <span className="pointer-events-none inline-block h-5 w-5 translate-x-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out" />
              </div>
            </div>

             <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium text-foreground">CONNECT (Booking Online)</Label>
                <p className="text-sm text-muted-foreground">Sistem booking real-time & WhatsApp otomatis.</p>
              </div>
              <div className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-primary transition-colors">
                 <span className="pointer-events-none inline-block h-5 w-5 translate-x-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out" />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium text-muted-foreground">OPERATE (Operasional)</Label>
                <p className="text-sm text-muted-foreground">Shift, inventaris, dan kasir odontogram (Phase 2).</p>
              </div>
              <div className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-muted transition-colors">
                 <span className="pointer-events-none inline-block h-5 w-5 translate-x-0 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out" />
              </div>
            </div>
            
             <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium text-muted-foreground">INTELLIGENCE (Analitik)</Label>
                <p className="text-sm text-muted-foreground">Dashboard lengkap & laporan multi-cabang (Phase 2).</p>
              </div>
              <div className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-muted transition-colors">
                 <span className="pointer-events-none inline-block h-5 w-5 translate-x-0 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}