"use client"



import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Eye, EyeOff } from "lucide-react";
import { sanitizeSvg } from "@/lib/utils";

interface SVGViewerProps {
  svgContent: string;
  onDownload?: () => void;
}

// UTF-8対応のBase64エンコード関数
const base64EncodeUnicode = (str: string) => {
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
    function toSolidBytes(match, p1) {
      return String.fromCharCode(parseInt(p1, 16));
    }
  ));
};

export default function SVGViewer({ svgContent, onDownload }: SVGViewerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [dataUrl, setDataUrl] = useState("");
  const [sanitizedContent, setSanitizedContent] = useState("");

  useEffect(() => {
    const sanitized = sanitizeSvg(svgContent);
    setSanitizedContent(sanitized);
    const encodedSvg = base64EncodeUnicode(sanitized);
    const url = `data:image/svg+xml;base64,${encodedSvg}`;
    setDataUrl(url);

    console.log("Sanitized SVG Content:", sanitized);
    console.log("Generated Data URL:", url);

    // Clean up object URL if created (though not strictly necessary for data URLs)
    return () => {
      // No cleanup needed for data URLs
    };
  }, [svgContent]);

  const handleDownload = () => {
    const blob = new Blob([sanitizedContent], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cookie-cutter.svg";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onDownload?.();
  };

  return (
    <Card className="border-amber-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm text-amber-800 flex items-center gap-2">🎨 SVGプレビュー</CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="border-amber-300 text-amber-700 hover:bg-amber-50"
            >
              {isExpanded ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="border-amber-300 text-amber-700 hover:bg-amber-50 bg-transparent"
              disabled={!sanitizedContent}
            >
              <Download className="h-4 w-4 mr-1" />
              SVG
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-white border border-amber-200 rounded-lg p-4">
          <div className="w-full h-32 flex items-center justify-center bg-gray-50 rounded border overflow-hidden">
            {dataUrl && (
              <img
                src={dataUrl}
                alt="SVG Preview"
                className="max-w-full max-h-full"
              />
            )}
          </div>
        </div>
        {isExpanded && (
          <div className="mt-3">
            <div className="text-xs text-gray-600 mb-2">SVGコード:</div>
            <pre className="text-xs bg-gray-100 p-3 rounded border overflow-x-auto max-h-40">
              <code>{sanitizedContent}</code>
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

