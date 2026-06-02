import { stitch } from "@google/stitch-sdk";
import fs from 'fs';

(async () => {
    try {
        console.log("Mencoba mengambil data project...");
        const project = stitch.project("2996747450269850416");
        const screens = await project.screens();
        
        for (const screen of screens) {
            if (screen.id === "87b6cd5af1ea4eb4874cf569c5d6d979") {
                const html = await screen.getHtml();
                const image = await screen.getImage(); 
                fs.writeFileSync('stitch_html.html', html);
                console.log('✅ HTML berhasil disimpan ke stitch_html.html');
                console.log('✅ Image URL:', image);
            }
        }
        console.log("Proses selesai.");
    } catch (e) {
        console.error("Gagal mengambil data dari Stitch SDK:", e);
    }
})();
