"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save, Eye, Plus, Trash2, Image as ImageIcon, Copy } from "lucide-react";
import * as fabric from "fabric";
import { toast } from "sonner";

const CATEGORIES = [
  { value: 'aniversario', label: '🎉 Aniversário' },
  { value: 'promocao', label: '🔥 Promoções' },
  { value: 'vaga', label: '💼 Vagas' },
  { value: 'dica', label: '💡 Dicas' },
  { value: 'motivacional', label: '✨ Motivacional' },
  { value: 'basico', label: '📐 Básico' },
];

const CANVAS_SIZES = [
  { label: "Post Instagram (1080x1080)", width: 1080, height: 1080 },
  { label: "Story Instagram (1080x1920)", width: 1080, height: 1920 },
  { label: "Banner Facebook (1200x630)", width: 1200, height: 630 },
  { label: "Banner Twitter (1500x500)", width: 1500, height: 500 },
  { label: "Banner LinkedIn (1200x627)", width: 1200, height: 627 },
  { label: "Thumbnail YouTube (1280x720)", width: 1280, height: 720 },
];

export default function CreateTemplatePage() {
  const router = useRouter();
  const supabase = createClient();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Form data
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("basico");
  const [templateKey, setTemplateKey] = useState("");
  const [displayOrder, setDisplayOrder] = useState(0);
  
  // Canvas size
  const [canvasSize, setCanvasSize] = useState({ width: 1080, height: 1080 });
  const [selectedSizePreset, setSelectedSizePreset] = useState("0");
  const [customWidth, setCustomWidth] = useState("1080");
  const [customHeight, setCustomHeight] = useState("1080");
  const [showCustomSize, setShowCustomSize] = useState(false);
  
  // Pages system
  const [pages, setPages] = useState<Array<{ id: string; data: any; thumbnail?: string }>>([
    { id: '1', data: null }
  ]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  
  // Zoom
  const [zoom, setZoom] = useState(0.5);
  
  // Color picker
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [customColor, setCustomColor] = useState('#FF6400');
  const [colorR, setColorR] = useState('255');
  const [colorG, setColorG] = useState('100');
  const [colorB, setColorB] = useState('0');
  
  // Layers
  const [layers, setLayers] = useState<fabric.FabricObject[]>([]);
  const [selectedLayer, setSelectedLayer] = useState<fabric.FabricObject | null>(null);
  const [editingProps, setEditingProps] = useState<any>({});

  // Auto-fit canvas to screen
  const fitCanvasToScreen = useCallback((fabricCanvas: fabric.Canvas) => {
    if (!canvasContainerRef.current) return;
    
    const container = canvasContainerRef.current;
    const containerWidth = container.clientWidth - 50; // Minimal padding
    const containerHeight = container.clientHeight - 50; // Minimal padding
    
    const canvasWidth = fabricCanvas.getWidth();
    const canvasHeight = fabricCanvas.getHeight();
    
    const scaleX = containerWidth / canvasWidth;
    const scaleY = containerHeight / canvasHeight;
    const optimalZoom = Math.min(scaleX, scaleY, 0.95); // Max 95% instead of 80%
    
    fabricCanvas.setZoom(optimalZoom);
    fabricCanvas.setDimensions({
      width: canvasWidth * optimalZoom,
      height: canvasHeight * optimalZoom
    }, { cssOnly: true });
    fabricCanvas.renderAll();
    setZoom(optimalZoom);
  }, []);
  
  // Refresh layers list
  const refreshLayers = useCallback((canvasInstance?: fabric.Canvas) => {
    const targetCanvas = canvasInstance || canvas;
    if (!targetCanvas) return;
    const objects = targetCanvas.getObjects();
    console.log('Refreshing layers, found:', objects.length);
    setLayers([...objects]);
  }, [canvas]);

  // Initialize Canvas
  useEffect(() => {
    if (!canvasRef.current || !canvasContainerRef.current) return;

    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      width: canvasSize.width,
      height: canvasSize.height,
      backgroundColor: "#FFFFFF",
    });
    
    // Listen to canvas events for layers
    fabricCanvas.on('object:added', () => refreshLayers(fabricCanvas));
    fabricCanvas.on('object:removed', () => refreshLayers(fabricCanvas));
    fabricCanvas.on('object:modified', () => {
      refreshLayers(fabricCanvas);
      const active = fabricCanvas.getActiveObject();
      if (active) updateEditingProps(active);
    });
    fabricCanvas.on('selection:created', (e) => {
      const obj = e.selected?.[0] || null;
      setSelectedLayer(obj);
      if (obj) updateEditingProps(obj);
    });
    fabricCanvas.on('selection:updated', (e) => {
      const obj = e.selected?.[0] || null;
      setSelectedLayer(obj);
      if (obj) updateEditingProps(obj);
    });
    fabricCanvas.on('selection:cleared', () => {
      setSelectedLayer(null);
      setEditingProps({});
    });

    setCanvas(fabricCanvas);
    
    // Initial layers refresh
    refreshLayers(fabricCanvas);
    
    // Fit canvas after initialization with multiple attempts
    setTimeout(() => fitCanvasToScreen(fabricCanvas), 100);
    setTimeout(() => fitCanvasToScreen(fabricCanvas), 300);
    setTimeout(() => fitCanvasToScreen(fabricCanvas), 500);
    
    // Monitor resize
    const resizeObserver = new ResizeObserver(() => {
      fitCanvasToScreen(fabricCanvas);
    });
    
    resizeObserver.observe(canvasContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      fabricCanvas.dispose();
    };
  }, [fitCanvasToScreen]);

  // Save current page data before switching
  const saveCurrentPageData = useCallback(() => {
    if (!canvas) return;
    
    const canvasData = canvas.toJSON();
    const thumbnail = canvas.toDataURL({ format: "png", quality: 0.3, multiplier: 0.15 });
    
    setPages((prev) => {
      const updated = [...prev];
      updated[currentPageIndex] = {
        ...updated[currentPageIndex],
        data: canvasData,
        thumbnail,
      };
      return updated;
    });
  }, [canvas, currentPageIndex]);

  // Load page data when switching
  const loadPageData = useCallback(async (pageIndex: number) => {
    if (!canvas) return;
    
    const pageData = pages[pageIndex]?.data;
    
    if (pageData) {
      await canvas.loadFromJSON(pageData);
      canvas.renderAll();
    } else {
      canvas.clear();
      canvas.backgroundColor = "#FFFFFF";
      canvas.renderAll();
    }
    
    setCurrentPageIndex(pageIndex);
  }, [canvas, pages]);

  // Switch page
  const switchPage = (index: number) => {
    saveCurrentPageData();
    loadPageData(index);
  };

  // Add new page
  const addNewPage = () => {
    saveCurrentPageData();
    const newPage = { id: Date.now().toString(), data: null, thumbnail: undefined };
    setPages([...pages, newPage]);
    setCurrentPageIndex(pages.length);
    
    if (canvas) {
      canvas.clear();
      canvas.backgroundColor = "#FFFFFF";
      canvas.renderAll();
    }
  };

  // Duplicate current page
  const duplicatePage = () => {
    saveCurrentPageData();
    const currentPage = pages[currentPageIndex];
    const duplicatedPage = {
      id: Date.now().toString(),
      data: currentPage.data ? JSON.parse(JSON.stringify(currentPage.data)) : null,
      thumbnail: currentPage.thumbnail,
    };
    const newPages = [...pages];
    newPages.splice(currentPageIndex + 1, 0, duplicatedPage);
    setPages(newPages);
  };

  // Delete page
  const deletePage = (index: number) => {
    if (pages.length === 1) {
      toast.error("Não é possível deletar a única página");
      return;
    }
    
    const newPages = pages.filter((_, i) => i !== index);
    setPages(newPages);
    
    if (currentPageIndex >= newPages.length) {
      loadPageData(newPages.length - 1);
    } else if (currentPageIndex === index) {
      loadPageData(Math.max(0, index - 1));
    }
  };

  // Change canvas size
  const changeCanvasSize = (presetIndex: string) => {
    setSelectedSizePreset(presetIndex);
    
    if (presetIndex === "custom") {
      setShowCustomSize(true);
      return;
    }
    
    setShowCustomSize(false);
    const preset = CANVAS_SIZES[parseInt(presetIndex)];
    
    if (canvas && preset) {
      canvas.setWidth(preset.width);
      canvas.setHeight(preset.height);
      setCanvasSize({ width: preset.width, height: preset.height });
      setCustomWidth(preset.width.toString());
      setCustomHeight(preset.height.toString());
      canvas.renderAll();
      
      // Refit to screen after size change
      setTimeout(() => fitCanvasToScreen(canvas), 50);
    }
  };
  
  // Apply custom canvas size
  const applyCustomSize = () => {
    const width = parseInt(customWidth);
    const height = parseInt(customHeight);
    
    if (isNaN(width) || isNaN(height) || width < 100 || height < 100) {
      toast.error("Dimensões inválidas. Mínimo: 100x100px");
      return;
    }
    
    if (width > 5000 || height > 5000) {
      toast.error("Dimensões muito grandes. Máximo: 5000x5000px");
      return;
    }
    
    if (canvas) {
      canvas.setWidth(width);
      canvas.setHeight(height);
      setCanvasSize({ width, height });
      canvas.renderAll();
      setTimeout(() => fitCanvasToScreen(canvas), 50);
      toast.success(`Canvas ajustado para ${width}x${height}px`);
    }
  };
  
  // Adjust canvas to image size
  const adjustCanvasToImage = (img: fabric.FabricImage) => {
    if (!canvas) return;
    
    // Use original image dimensions (not scaled)
    const imgWidth = img.width;
    const imgHeight = img.height;
    
    canvas.setWidth(Math.round(imgWidth));
    canvas.setHeight(Math.round(imgHeight));
    setCanvasSize({ width: Math.round(imgWidth), height: Math.round(imgHeight) });
    setCustomWidth(Math.round(imgWidth).toString());
    setCustomHeight(Math.round(imgHeight).toString());
    
    // Position image to fill canvas at 100% (1:1 scale)
    img.set({
      left: Math.round(imgWidth / 2),
      top: Math.round(imgHeight / 2),
      scaleX: 1,
      scaleY: 1,
      originX: "center",
      originY: "center",
    });
    
    canvas.renderAll();
    setTimeout(() => fitCanvasToScreen(canvas), 50);
    
    toast.success(`Canvas ajustado para ${Math.round(imgWidth)}x${Math.round(imgHeight)}px`);
  };

  // Auto-gerar template_key baseado no título
  useEffect(() => {
    if (title) {
      const key = title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setTemplateKey(key);
    }
  }, [title]);

  const handleSaveTemplate = async () => {
    if (!canvas) {
      toast.error("Canvas não inicializado");
      return;
    }

    if (!title.trim()) {
      toast.error("Título é obrigatório");
      return;
    }

    if (!templateKey.trim()) {
      toast.error("Chave do template é obrigatória");
      return;
    }

    setSaving(true);

    try {
      // Save current page before saving template
      saveCurrentPageData();
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Você precisa estar logado");
        router.push("/login");
        return;
      }

      // Prepare canvas data with pages
      const allPagesData = pages.map((page, index) => {
        if (index === currentPageIndex) {
          return {
            ...page,
            data: canvas.toJSON(),
            thumbnail: canvas.toDataURL({ format: "png", quality: 0.3, multiplier: 0.15 }),
          };
        }
        return page;
      });

      const canvasDataWithPages = {
        pages: allPagesData.map(p => p.data),
        currentPage: 0,
        width: canvasSize.width,
        height: canvasSize.height,
      };

      // Generate thumbnail from first page
      const thumbnailDataUrl = allPagesData[0]?.thumbnail || canvas.toDataURL({
        format: "png",
        quality: 0.7,
        multiplier: 0.2,
      });

      // Save template to database
      const { error } = await supabase
        .from("template_artes")
        .insert({
          title,
          description,
          category,
          template_key: templateKey,
          canvas_data: canvasDataWithPages,
          thumbnail_url: thumbnailDataUrl,
          display_order: displayOrder,
          created_by: user.id,
          is_active: true,
        });

      if (error) {
        console.error("Erro ao salvar:", error);
        throw error;
      }

      toast.success("Template criado com sucesso!");
      router.push("/admin/templates");
    } catch (error: any) {
      console.error("Erro ao salvar template:", error);
      toast.error(error.message || "Erro ao salvar template");
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    if (!canvas) return;
    
    const dataUrl = canvas.toDataURL({ format: "png", quality: 1, multiplier: 1 });
    const win = window.open();
    if (win) {
      win.document.write(`<img src="${dataUrl}" style="max-width: 100%; height: auto;" />`);
    }
  };

  // Add Text
  const addText = () => {
    if (!canvas) return;
    
    const text = new fabric.IText("Clique para editar", {
      left: 100,
      top: 100,
      fontSize: 40,
      fill: "#000000",
      fontFamily: "Arial",
    });
    
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
    refreshLayers();
  };

  // Add Rectangle
  const addRectangle = () => {
    if (!canvas) return;
    
    const rect = new fabric.Rect({
      left: 100,
      top: 100,
      width: 200,
      height: 200,
      fill: "#FF6400",
    });
    
    canvas.add(rect);
    canvas.setActiveObject(rect);
    canvas.renderAll();
    refreshLayers();
  };

  // Add Circle
  const addCircle = () => {
    if (!canvas) return;
    
    const circle = new fabric.Circle({
      left: 100,
      top: 100,
      radius: 100,
      fill: "#3B82F6",
    });
    
    canvas.add(circle);
    canvas.setActiveObject(circle);
    canvas.renderAll();
    refreshLayers();
  };
  
  // Layer controls
  const selectLayer = (obj: fabric.FabricObject) => {
    if (!canvas) return;
    canvas.setActiveObject(obj);
    canvas.renderAll();
    setSelectedLayer(obj);
    updateEditingProps(obj);
  };
  
  const updateEditingProps = (obj: fabric.FabricObject) => {
    const props: any = {
      left: Math.round(obj.left || 0),
      top: Math.round(obj.top || 0),
      width: Math.round((obj.width || 0) * (obj.scaleX || 1)),
      height: Math.round((obj.height || 0) * (obj.scaleY || 1)),
      angle: Math.round(obj.angle || 0),
      opacity: obj.opacity || 1,
    };
    
    if (obj.type === 'textbox' || obj.type === 'text' || obj.type === 'i-text') {
      props.text = (obj as any).text || '';
      props.fontSize = (obj as any).fontSize || 20;
      props.fill = (obj as any).fill || '#000000';
      props.fontFamily = (obj as any).fontFamily || 'Arial';
    } else if (obj.type === 'rect' || obj.type === 'circle') {
      props.fill = (obj as any).fill || '#000000';
      props.stroke = (obj as any).stroke || '';
      props.strokeWidth = (obj as any).strokeWidth || 0;
    }
    
    setEditingProps(props);
  };
  
  const applyPropertyChange = (property: string, value: any) => {
    if (!selectedLayer || !canvas) return;
    
    if (property === 'text') {
      (selectedLayer as any).set('text', value);
    } else if (property === 'fontSize') {
      (selectedLayer as any).set('fontSize', parseInt(value) || 20);
    } else if (property === 'fill') {
      (selectedLayer as any).set('fill', value);
    } else if (property === 'fontFamily') {
      (selectedLayer as any).set('fontFamily', value);
    } else if (property === 'left') {
      selectedLayer.set('left', parseInt(value) || 0);
    } else if (property === 'top') {
      selectedLayer.set('top', parseInt(value) || 0);
    } else if (property === 'angle') {
      selectedLayer.set('angle', parseInt(value) || 0);
    } else if (property === 'opacity') {
      selectedLayer.set('opacity', parseFloat(value) || 1);
    } else if (property === 'stroke') {
      (selectedLayer as any).set('stroke', value);
    } else if (property === 'strokeWidth') {
      (selectedLayer as any).set('strokeWidth', parseInt(value) || 0);
    }
    
    canvas.renderAll();
    updateEditingProps(selectedLayer);
  };
  
  const toggleLayerVisibility = (obj: fabric.FabricObject) => {
    if (!canvas) return;
    obj.visible = !obj.visible;
    canvas.renderAll();
    refreshLayers();
  };
  
  const bringLayerForward = (obj: fabric.FabricObject) => {
    if (!canvas) return;
    const objects = canvas.getObjects();
    const currentIndex = objects.indexOf(obj);
    if (currentIndex < objects.length - 1) {
      canvas.remove(obj);
      canvas.insertAt(currentIndex + 1, obj);
      canvas.renderAll();
      refreshLayers();
    }
  };
  
  const sendLayerBackward = (obj: fabric.FabricObject) => {
    if (!canvas) return;
    const objects = canvas.getObjects();
    const currentIndex = objects.indexOf(obj);
    if (currentIndex > 0) {
      canvas.remove(obj);
      canvas.insertAt(currentIndex - 1, obj);
      canvas.renderAll();
      refreshLayers();
    }
  };
  
  const bringLayerToFront = (obj: fabric.FabricObject) => {
    if (!canvas) return;
    canvas.remove(obj);
    canvas.add(obj);
    canvas.renderAll();
    refreshLayers();
  };
  
  const sendLayerToBack = (obj: fabric.FabricObject) => {
    if (!canvas) return;
    canvas.remove(obj);
    canvas.insertAt(0, obj);
    canvas.renderAll();
    refreshLayers();
  };
  
  const deleteLayer = (obj: fabric.FabricObject) => {
    if (!canvas) return;
    canvas.remove(obj);
    canvas.renderAll();
    refreshLayers();
    toast.success('Camada removida');
  };
  
  const getLayerName = (obj: fabric.FabricObject): string => {
    if (obj.type === 'textbox' || obj.type === 'text' || obj.type === 'i-text') {
      const text = (obj as any).text || '';
      return `Texto: ${text.substring(0, 15)}${text.length > 15 ? '...' : ''}`;
    }
    if (obj.type === 'rect') return 'Retângulo';
    if (obj.type === 'circle') return 'Círculo';
    if (obj.type === 'image') return 'Imagem';
    return obj.type || 'Objeto';
  };

  // Add Image from file
  const addImageFromFile = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file || !canvas) return;

      const reader = new FileReader();
      reader.onload = async (event) => {
        const dataUrl = event.target?.result as string;
        
        try {
          const img = await fabric.FabricImage.fromURL(dataUrl);
          
          // Scale image to fit canvas
          const maxWidth = canvas.getWidth() * 0.5;
          const maxHeight = canvas.getHeight() * 0.5;
          const scale = Math.min(maxWidth / img.width, maxHeight / img.height);
          
          img.scale(scale);
          img.set({
            left: canvas.getWidth() / 2,
            top: canvas.getHeight() / 2,
            originX: "center",
            originY: "center",
          });
          
          canvas.add(img);
          canvas.setActiveObject(img);
          canvas.renderAll();
          refreshLayers();
          
          toast.success("Imagem adicionada!");
        } catch (error) {
          console.error("Erro ao adicionar imagem:", error);
          toast.error("Erro ao adicionar imagem");
        }
      };
      
      reader.readAsDataURL(file);
    };
    
    input.click();
  };

  // Change background color
  const changeBackground = (color: string) => {
    if (!canvas) return;
    canvas.backgroundColor = color;
    canvas.renderAll();
  };
  
  // Apply custom RGB color
  const applyCustomColor = () => {
    const r = parseInt(colorR) || 0;
    const g = parseInt(colorG) || 0;
    const b = parseInt(colorB) || 0;
    
    if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) {
      toast.error('Valores RGB devem estar entre 0 e 255');
      return;
    }
    
    const rgbColor = `rgb(${r}, ${g}, ${b})`;
    changeBackground(rgbColor);
    setCustomColor(rgbColor);
    toast.success(`Cor aplicada: ${rgbColor}`);
  };
  
  // Update RGB from hex color picker
  const updateRGBFromHex = (hex: string) => {
    setCustomColor(hex);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
      setColorR(parseInt(result[1], 16).toString());
      setColorG(parseInt(result[2], 16).toString());
      setColorB(parseInt(result[3], 16).toString());
    }
    changeBackground(hex);
  };

  // Zoom controls
  const handleZoomIn = () => {
    if (!canvas) return;
    const newZoom = Math.min(zoom + 0.1, 2);
    canvas.setZoom(newZoom);
    canvas.setDimensions({
      width: canvas.getWidth() * newZoom,
      height: canvas.getHeight() * newZoom
    }, { cssOnly: true });
    canvas.renderAll();
    setZoom(newZoom);
  };

  const handleZoomOut = () => {
    if (!canvas) return;
    const newZoom = Math.max(zoom - 0.1, 0.1);
    canvas.setZoom(newZoom);
    canvas.setDimensions({
      width: canvas.getWidth() * newZoom,
      height: canvas.getHeight() * newZoom
    }, { cssOnly: true });
    canvas.renderAll();
    setZoom(newZoom);
  };
  
  const resetZoom = () => {
    if (!canvas) return;
    fitCanvasToScreen(canvas);
  };

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-between px-6 py-3 shrink-0">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/admin/templates")}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-white">Criar Novo Template</h1>
          <span className="text-white/70 text-sm">
            Página {currentPageIndex + 1} de {pages.length}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleZoomOut}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20"
          >
            −
          </Button>
          <button
            onClick={resetZoom}
            className="text-white text-sm min-w-[60px] text-center hover:bg-white/20 rounded px-2 py-1"
          >
            {Math.round(zoom * 100)}%
          </button>
          <Button
            onClick={handleZoomIn}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20"
          >
            +
          </Button>
          <div className="w-px h-6 bg-white/30 mx-2" />
          <Button
            onClick={handlePreview}
            variant="ghost"
            className="text-white hover:bg-white/20 gap-2"
          >
            <Eye className="w-4 h-4" />
            Preview
          </Button>
          <Button
            onClick={handleSaveTemplate}
            disabled={saving}
            className="bg-white text-purple-600 hover:bg-gray-100 font-semibold gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? "Salvando..." : "Salvar Template"}
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Form & Tools */}
        <div className="w-80 bg-gray-50 border-r border-gray-200 overflow-y-auto p-6 space-y-4">
          {/* Form Fields */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div>
                <Label htmlFor="title">Título do Template *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Aniversário Festa"
                />
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Breve descrição"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="category">Categoria *</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="templateKey">Chave *</Label>
                <Input
                  id="templateKey"
                  value={templateKey}
                  onChange={(e) => setTemplateKey(e.target.value)}
                  placeholder="auto-gerada"
                  className="text-sm"
                />
              </div>

              <div>
                <Label htmlFor="displayOrder">Ordem</Label>
                <Input
                  id="displayOrder"
                  type="number"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(Number(e.target.value))}
                  placeholder="0"
                />
              </div>
            </CardContent>
          </Card>

          {/* Canvas Size */}
          <Card>
            <CardContent className="pt-6 space-y-3">
              <div>
                <Label>Tamanho do Canvas</Label>
                <Select value={selectedSizePreset} onValueChange={changeCanvasSize}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CANVAS_SIZES.map((size, index) => (
                      <SelectItem key={index} value={index.toString()}>
                        {size.label}
                      </SelectItem>
                    ))}
                    <SelectItem value="custom">
                      Personalizado
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  {canvasSize.width} x {canvasSize.height} px
                </p>
              </div>

              {/* Custom Size Inputs */}
              {showCustomSize && (
                <div className="space-y-3 pt-2 border-t">
                  <div>
                    <Label htmlFor="customWidth">Largura (px)</Label>
                    <Input
                      id="customWidth"
                      type="number"
                      value={customWidth}
                      onChange={(e) => setCustomWidth(e.target.value)}
                      placeholder="1080"
                      min="100"
                      max="5000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="customHeight">Altura (px)</Label>
                    <Input
                      id="customHeight"
                      type="number"
                      value={customHeight}
                      onChange={(e) => setCustomHeight(e.target.value)}
                      placeholder="1080"
                      min="100"
                      max="5000"
                    />
                  </div>
                  <Button 
                    onClick={applyCustomSize} 
                    variant="default" 
                    size="sm" 
                    className="w-full"
                  >
                    Aplicar Tamanho
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tools */}
          <Card>
            <CardContent className="pt-6 space-y-2">
              <h3 className="font-semibold mb-3 text-sm">Adicionar Elementos</h3>
              
              <Button onClick={addText} variant="outline" size="sm" className="w-full justify-start">
                Texto
              </Button>
              
              <Button onClick={addRectangle} variant="outline" size="sm" className="w-full justify-start">
                Retângulo
              </Button>
              
              <Button onClick={addCircle} variant="outline" size="sm" className="w-full justify-start">
                Círculo
              </Button>
              
              <Button onClick={addImageFromFile} variant="outline" size="sm" className="w-full justify-start gap-2">
                <ImageIcon className="w-4 h-4" />
                Imagem
              </Button>
              
              <Button 
                onClick={() => {
                  const obj = canvas?.getActiveObject();
                  if (obj && obj.type === 'image') {
                    adjustCanvasToImage(obj as fabric.FabricImage);
                  } else {
                    toast.error('Selecione uma imagem primeiro');
                  }
                }} 
                variant="outline" 
                size="sm" 
                className="w-full justify-start gap-2"
              >
                <ImageIcon className="w-4 h-4" />
                Ajustar Canvas à Imagem
              </Button>

              <div className="pt-3 border-t">
                <h4 className="font-medium mb-2 text-xs">Cor de Fundo</h4>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {['#FFFFFF', '#000000', '#FF6400', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'].map((color) => (
                    <button
                      key={color}
                      onClick={() => changeBackground(color)}
                      className="w-full h-8 rounded border-2 border-gray-300 hover:border-gray-500"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                
                <Button 
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                >
                  {showColorPicker ? 'Fechar' : 'Cor Personalizada'}
                </Button>
                
                {showColorPicker && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg space-y-3">
                    <div>
                      <Label className="text-xs">Seletor de Cor</Label>
                      <input
                        type="color"
                        value={customColor}
                        onChange={(e) => updateRGBFromHex(e.target.value)}
                        className="w-full h-10 rounded border cursor-pointer"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-xs">RGB Manual</Label>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <Label className="text-xs text-gray-500">R</Label>
                          <Input
                            type="number"
                            value={colorR}
                            onChange={(e) => setColorR(e.target.value)}
                            min="0"
                            max="255"
                            className="h-8"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">G</Label>
                          <Input
                            type="number"
                            value={colorG}
                            onChange={(e) => setColorG(e.target.value)}
                            min="0"
                            max="255"
                            className="h-8"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">B</Label>
                          <Input
                            type="number"
                            value={colorB}
                            onChange={(e) => setColorB(e.target.value)}
                            min="0"
                            max="255"
                            className="h-8"
                          />
                        </div>
                      </div>
                      <Button 
                        onClick={applyCustomColor}
                        size="sm" 
                        className="w-full"
                      >
                        Aplicar RGB
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Canvas Container */}
          <div 
            ref={canvasContainerRef}
            className="flex-1 flex items-center justify-center bg-gray-100 overflow-auto"
          >
            <canvas ref={canvasRef} />
          </div>

          {/* Pages Bar */}
          <div className="bg-gray-50 border-t border-gray-200 p-4">
            <div className="flex items-center gap-3 overflow-x-auto">
              {pages.map((page, index) => (
                <div
                  key={page.id}
                  className={`relative flex-shrink-0 group ${
                    index === currentPageIndex ? 'ring-2 ring-purple-500' : ''
                  }`}
                >
                  <button
                    onClick={() => switchPage(index)}
                    className="relative w-24 h-24 bg-white border-2 border-gray-300 rounded-lg overflow-hidden hover:border-purple-400 transition-colors"
                  >
                    {page.thumbnail ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img 
                        src={page.thumbnail} 
                        alt={`Página ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                        Página {index + 1}
                      </div>
                    )}
                  </button>
                  
                  {/* Delete button */}
                  {pages.length > 1 && (
                    <button
                      onClick={() => deletePage(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
              
              {/* Add Page Button */}
              <button
                onClick={addNewPage}
                className="flex-shrink-0 w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors flex flex-col items-center justify-center gap-1 text-gray-500 hover:text-purple-600"
              >
                <Plus className="w-6 h-6" />
                <span className="text-xs">Nova</span>
              </button>
              
              {/* Duplicate Page Button */}
              <button
                onClick={duplicatePage}
                className="flex-shrink-0 w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors flex flex-col items-center justify-center gap-1 text-gray-500 hover:text-blue-600"
              >
                <Copy className="w-6 h-6" />
                <span className="text-xs">Duplicar</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Right Sidebar - Layers & Properties */}
        <div className="w-80 bg-gray-50 border-l border-gray-200 overflow-y-auto p-4 space-y-4">
          {/* Layers Panel */}
          <Card>
            <CardContent className="pt-4">
              <h3 className="font-semibold mb-3 text-sm">🎨 Camadas</h3>
              <div className="space-y-1 max-h-96 overflow-y-auto">
                {layers.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-8">Nenhuma camada ainda</p>
                ) : (
                  [...layers].reverse().map((obj, index) => {
                    const isSelected = selectedLayer === obj;
                    const realIndex = layers.length - 1 - index;
                    return (
                      <div
                        key={realIndex}
                        className={`flex items-center gap-2 p-2 rounded border transition-colors ${
                          isSelected ? 'bg-purple-50 border-purple-400 shadow-sm' : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <button
                          onClick={() => toggleLayerVisibility(obj)}
                          className="flex-shrink-0 w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded text-sm"
                          title={obj.visible ? 'Ocultar' : 'Mostrar'}
                        >
                          {obj.visible ? '👁️' : '👻'}
                        </button>
                        
                        <button
                          onClick={() => selectLayer(obj)}
                          className="flex-1 text-left text-xs font-medium truncate"
                        >
                          {getLayerName(obj)}
                        </button>
                        
                        <div className="flex gap-0.5">
                          <button
                            onClick={() => bringLayerToFront(obj)}
                            className="w-5 h-5 flex items-center justify-center hover:bg-purple-100 rounded text-[10px]"
                            title="Trazer para frente"
                          >
                            ⏫
                          </button>
                          <button
                            onClick={() => bringLayerForward(obj)}
                            className="w-5 h-5 flex items-center justify-center hover:bg-purple-100 rounded text-[10px]"
                            title="Avançar"
                          >
                            ▲
                          </button>
                          <button
                            onClick={() => sendLayerBackward(obj)}
                            className="w-5 h-5 flex items-center justify-center hover:bg-purple-100 rounded text-[10px]"
                            title="Recuar"
                          >
                            ▼
                          </button>
                          <button
                            onClick={() => sendLayerToBack(obj)}
                            className="w-5 h-5 flex items-center justify-center hover:bg-purple-100 rounded text-[10px]"
                            title="Enviar para trás"
                          >
                            ⏬
                          </button>
                          <button
                            onClick={() => deleteLayer(obj)}
                            className="w-5 h-5 flex items-center justify-center hover:bg-red-100 rounded text-red-600 text-xs font-bold"
                            title="Remover"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Properties Panel */}
          {selectedLayer && (
            <Card>
              <CardContent className="pt-4">
                <h3 className="font-semibold mb-3 text-sm">⚙️ Propriedades</h3>
                <div className="space-y-3">
                  {/* Position */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">X</Label>
                      <Input
                        type="number"
                        value={editingProps.left || 0}
                        onChange={(e) => applyPropertyChange('left', e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Y</Label>
                      <Input
                        type="number"
                        value={editingProps.top || 0}
                        onChange={(e) => applyPropertyChange('top', e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>
                  
                  {/* Size */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Largura</Label>
                      <Input
                        type="number"
                        value={editingProps.width || 0}
                        readOnly
                        className="h-8 text-xs bg-gray-100"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Altura</Label>
                      <Input
                        type="number"
                        value={editingProps.height || 0}
                        readOnly
                        className="h-8 text-xs bg-gray-100"
                      />
                    </div>
                  </div>
                  
                  {/* Rotation & Opacity */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Rotação (°)</Label>
                      <Input
                        type="number"
                        value={editingProps.angle || 0}
                        onChange={(e) => applyPropertyChange('angle', e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Opacidade</Label>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        max="1"
                        value={editingProps.opacity || 1}
                        onChange={(e) => applyPropertyChange('opacity', e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>
                  
                  {/* Text Properties */}
                  {(selectedLayer.type === 'textbox' || selectedLayer.type === 'text' || selectedLayer.type === 'i-text') && (
                    <>
                      <div>
                        <Label className="text-xs">Texto</Label>
                        <Textarea
                          value={editingProps.text || ''}
                          onChange={(e) => applyPropertyChange('text', e.target.value)}
                          className="text-xs"
                          rows={2}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs">Tamanho</Label>
                          <Input
                            type="number"
                            value={editingProps.fontSize || 20}
                            onChange={(e) => applyPropertyChange('fontSize', e.target.value)}
                            className="h-8 text-xs"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Fonte</Label>
                          <Select 
                            value={editingProps.fontFamily || 'Arial'} 
                            onValueChange={(value) => applyPropertyChange('fontFamily', value)}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Arial">Arial</SelectItem>
                              <SelectItem value="Helvetica">Helvetica</SelectItem>
                              <SelectItem value="Times New Roman">Times</SelectItem>
                              <SelectItem value="Courier New">Courier</SelectItem>
                              <SelectItem value="Verdana">Verdana</SelectItem>
                              <SelectItem value="Georgia">Georgia</SelectItem>
                              <SelectItem value="Comic Sans MS">Comic Sans</SelectItem>
                              <SelectItem value="Impact">Impact</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs">Cor do Texto</Label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={editingProps.fill || '#000000'}
                            onChange={(e) => applyPropertyChange('fill', e.target.value)}
                            className="w-full h-8 rounded border cursor-pointer"
                          />
                          <Input
                            value={editingProps.fill || '#000000'}
                            onChange={(e) => applyPropertyChange('fill', e.target.value)}
                            className="h-8 text-xs flex-1"
                            placeholder="#000000"
                          />
                        </div>
                      </div>
                    </>
                  )}
                  
                  {/* Shape Properties */}
                  {(selectedLayer.type === 'rect' || selectedLayer.type === 'circle') && (
                    <>
                      <div>
                        <Label className="text-xs">Cor de Preenchimento</Label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={editingProps.fill || '#000000'}
                            onChange={(e) => applyPropertyChange('fill', e.target.value)}
                            className="w-full h-8 rounded border cursor-pointer"
                          />
                          <Input
                            value={editingProps.fill || '#000000'}
                            onChange={(e) => applyPropertyChange('fill', e.target.value)}
                            className="h-8 text-xs flex-1"
                            placeholder="#000000"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs">Cor da Borda</Label>
                          <input
                            type="color"
                            value={editingProps.stroke || '#000000'}
                            onChange={(e) => applyPropertyChange('stroke', e.target.value)}
                            className="w-full h-8 rounded border cursor-pointer"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Largura Borda</Label>
                          <Input
                            type="number"
                            value={editingProps.strokeWidth || 0}
                            onChange={(e) => applyPropertyChange('strokeWidth', e.target.value)}
                            className="h-8 text-xs"
                            min="0"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
