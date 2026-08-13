# أخبر Replit بكيفية تشغيل خادمك ومحرك المقاصة فوراً بمجرد الضغط على زر Run
run = "node server/app.js"

[nix]
channel = "stable-23_05"

[deployment]
run = "node server/app.js"

{ pkgs }: {
  deps = [
    pkgs.nodejs-18_x      # تثبيت الـ Node.js لتشغيل خادم المقاصة والاستدعاء المتوالي
    pkgs.python310        # تثبيت البايثون لتشغيل خوارزمية الأرقام الصحيحة الصارمة لـ BIGISH-YER
    pkgs.nodePackages.npm
  ];
}

