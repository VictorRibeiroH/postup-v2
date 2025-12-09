"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Save,
  Download,
  Type,
  Image as ImageIcon,
  Square,
  Circle,
  Trash2,
  Copy,
  Layers,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  Move,
  Palette,
} from "lucide-react";
import * as fabric from "fabric";
import { toast } from "sonner";

// CSS para prevenir scroll ao editar texto
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    .canvas-container {
      position: relative !important;
    }
  `;
  document.head.appendChild(style);
}

export default function EditorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [arteTitle, setArteTitle] = useState("Nova Arte");
  const [saving, setSaving] = useState(false);
  const [selectedObject, setSelectedObject] = useState<fabric.Object | null>(null);
  const [zoom, setZoom] = useState(1);
  const [canvasSize, setCanvasSize] = useState({ width: 1080, height: 1080 });
  const [activeSidebar, setActiveSidebar] = useState<'templates' | 'elements' | 'images' | 'text' | 'background' | null>('templates');
  
  // Pages system
  const [pages, setPages] = useState<Array<{ id: string; data: any; thumbnail?: string }>>([{ id: '1', data: null }]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  
  // User images gallery
  const [userImages, setUserImages] = useState<Array<{ id: string; url: string; name: string; thumbnail_url?: string }>>([]);
  const [loadingImages, setLoadingImages] = useState(false);
  
  // Stock photos from Unsplash
  const [stockPhotos, setStockPhotos] = useState<Array<{ id: string; url: string; thumb: string; author: string }>>([]);
  const [loadingStockPhotos, setLoadingStockPhotos] = useState(false);
  const [stockSearchQuery, setStockSearchQuery] = useState("");
  
  // Templates from database
  const [dbTemplates, setDbTemplates] = useState<Array<{ 
    id: string; 
    title: string; 
    description: string;
    category: string; 
    template_key: string; 
    canvas_data: any; 
    thumbnail_url: string;
  }>>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  
  // Text properties
  const [textColor, setTextColor] = useState("#000000");
  const [fontSize, setFontSize] = useState(40);
  const [fontFamily, setFontFamily] = useState("Arial");
  const [fontSearchInput, setFontSearchInput] = useState("Arial");
  const [textAlign, setTextAlign] = useState("left");
  const [fontWeight, setFontWeight] = useState("normal");
  const [fontStyle, setFontStyle] = useState("normal");
  const [textDecoration, setTextDecoration] = useState("");
  
  // Shape properties
  const [fillColor, setFillColor] = useState("#FF6400");
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(0);
  const [opacity, setOpacity] = useState(100);
  
  // Layers
  const [layers, setLayers] = useState<fabric.FabricObject[]>([]);
  const [selectedLayer, setSelectedLayer] = useState<fabric.FabricObject | null>(null);
  const [editingProps, setEditingProps] = useState<any>({});
  
  // Custom canvas size
  const [customWidth, setCustomWidth] = useState("1080");
  const [customHeight, setCustomHeight] = useState("1080");
  const [showCustomSize, setShowCustomSize] = useState(false);

  // Refresh layers list
  const refreshLayers = (canvasInstance?: fabric.Canvas) => {
    const targetCanvas = canvasInstance || canvas;
    if (!targetCanvas) return;
    const objects = targetCanvas.getObjects();
    setLayers([...objects]);
  };
  
  // Update editing props when layer is selected
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
      props.charSpacing = (obj as any).charSpacing || 0;
    } else if (obj.type === 'rect' || obj.type === 'circle') {
      props.fill = (obj as any).fill || '#000000';
      props.stroke = (obj as any).stroke || '';
      props.strokeWidth = (obj as any).strokeWidth || 0;
    }
    
    setEditingProps(props);
  };
  
  // Apply property changes
  const applyPropertyChange = (property: string, value: any) => {
    if (!selectedLayer || !canvas) return;
    
    if (property === 'text') {
      (selectedLayer as any).set('text', value);
    } else if (property === 'fontSize') {
      (selectedLayer as any).set('fontSize', parseInt(value) || 20);
    } else if (property === 'charSpacing') {
      (selectedLayer as any).set('charSpacing', parseInt(value) || 0);
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
  
  // Layer controls
  const selectLayer = (obj: fabric.FabricObject) => {
    if (!canvas) return;
    canvas.setActiveObject(obj);
    canvas.renderAll();
    setSelectedLayer(obj);
    updateEditingProps(obj);
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
  
  // Apply custom canvas size
  const applyCustomSize = () => {
    if (!canvas) return;
    
    const width = parseInt(customWidth);
    const height = parseInt(customHeight);
    
    if (isNaN(width) || isNaN(height)) {
      toast.error('Digite valores numéricos válidos');
      return;
    }
    
    if (width < 100 || width > 5000 || height < 100 || height > 5000) {
      toast.error('Dimensões devem estar entre 100 e 5000px');
      return;
    }
    
    canvas.setWidth(width);
    canvas.setHeight(height);
    setCanvasSize({ width, height });
    setTimeout(() => fitCanvasToScreen(canvas), 50);
    toast.success(`Canvas ajustado para ${width}x${height}px`);
  };
  
  // Adjust canvas to image size
  const adjustCanvasToImage = (img: fabric.FabricImage) => {
    if (!canvas) return;
    
    const imgWidth = img.width;
    const imgHeight = img.height;
    
    canvas.setWidth(Math.round(imgWidth));
    canvas.setHeight(Math.round(imgHeight));
    setCanvasSize({ width: Math.round(imgWidth), height: Math.round(imgHeight) });
    setCustomWidth(Math.round(imgWidth).toString());
    setCustomHeight(Math.round(imgHeight).toString());
    
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

  // Auto-fit canvas to screen
  const fitCanvasToScreen = (fabricCanvas: fabric.Canvas) => {
    if (!canvasContainerRef.current) return;
    
    const container = canvasContainerRef.current;
    const containerWidth = container.clientWidth - 50; // Minimal padding
    const containerHeight = container.clientHeight - 50; // Minimal padding
    
    const canvasWidth = fabricCanvas.getWidth();
    const canvasHeight = fabricCanvas.getHeight();
    
    // Calcular zoom para caber na tela
    const scaleX = containerWidth / canvasWidth;
    const scaleY = containerHeight / canvasHeight;
    const optimalZoom = Math.min(scaleX, scaleY, 0.95); // Max 95%
    
    fabricCanvas.setZoom(optimalZoom);
    fabricCanvas.setDimensions({
      width: canvasWidth * optimalZoom,
      height: canvasHeight * optimalZoom
    }, { cssOnly: true });
    fabricCanvas.renderAll();
    setZoom(optimalZoom);
  };

  // Initialize Canvas
  useEffect(() => {
    if (!canvasRef.current || !canvasContainerRef.current) return;

    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      width: 1080,
      height: 1080,
      backgroundColor: "#ffffff",
      preserveObjectStacking: true,
    });

    setCanvas(fabricCanvas);
    
    // Listen to canvas events for layers
    fabricCanvas.on('object:added', () => refreshLayers(fabricCanvas));
    fabricCanvas.on('object:removed', () => refreshLayers(fabricCanvas));
    fabricCanvas.on('object:modified', () => {
      refreshLayers(fabricCanvas);
      const active = fabricCanvas.getActiveObject();
      if (active) updateEditingProps(active);
    });

    // Fit canvas to screen initially
    setTimeout(() => fitCanvasToScreen(fabricCanvas), 100);
    
    // Initial layers refresh
    refreshLayers(fabricCanvas);

    // Selection events
    fabricCanvas.on("selection:created", (e: any) => {
      setSelectedObject(e.selected[0]);
      updatePropertiesFromObject(e.selected[0]);
      const obj = e.selected?.[0] || null;
      setSelectedLayer(obj);
      if (obj) updateEditingProps(obj);
    });

    fabricCanvas.on("selection:updated", (e: any) => {
      setSelectedObject(e.selected[0]);
      updatePropertiesFromObject(e.selected[0]);
      const obj = e.selected?.[0] || null;
      setSelectedLayer(obj);
      if (obj) updateEditingProps(obj);
    });

    fabricCanvas.on("selection:cleared", () => {
      setSelectedObject(null);
      setSelectedLayer(null);
      setEditingProps({});
    });

    // Auto-save page on canvas modifications
    let autoSaveTimeout: NodeJS.Timeout;
    const triggerAutoSave = () => {
      clearTimeout(autoSaveTimeout);
      autoSaveTimeout = setTimeout(() => {
        if (fabricCanvas) {
          const pageData = JSON.parse(JSON.stringify(fabricCanvas.toJSON()));
          setPages(prevPages => {
            const newPages = [...prevPages];
            newPages[currentPageIndex] = { 
              ...newPages[currentPageIndex], 
              data: pageData,
              thumbnail: fabricCanvas.toDataURL({ format: 'png', quality: 0.3, multiplier: 0.2 })
            };
            return newPages;
          });
        }
      }, 800);
    };

    fabricCanvas.on("object:modified", triggerAutoSave);
    fabricCanvas.on("object:added", triggerAutoSave);
    fabricCanvas.on("object:removed", triggerAutoSave);

    // Resize observer para ajustar quando a janela mudar de tamanho
    const resizeObserver = new ResizeObserver(() => {
      fitCanvasToScreen(fabricCanvas);
    });
    
    resizeObserver.observe(canvasContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      fabricCanvas.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load arte if editing (separate useEffect to ensure loadArte is defined)
  useEffect(() => {
    if (!canvas) return;
    
    const arteId = searchParams.get("arte");
    if (arteId) {
      console.log("Arte ID detected in URL:", arteId);
      loadArte(arteId, canvas);
    }
    
    // Load user images
    loadUserImages();
    
    // Load initial stock photos
    loadStockPhotos("business");
    
    // Load templates from database
    loadDbTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvas]);

  // Load templates from database
  const loadDbTemplates = async () => {
    setLoadingTemplates(true);
    try {
      const { data, error } = await supabase
        .from("template_artes")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) {
        console.error("Erro ao carregar templates:", error);
        toast.error("Erro ao carregar templates do banco");
        return;
      }

      console.log("Templates carregados:", data?.length || 0);
      setDbTemplates(data || []);
      
      if (data && data.length > 0) {
        toast.success(`${data.length} template(s) carregado(s)!`);
      }
    } catch (error) {
      console.error("Erro ao carregar templates:", error);
      toast.error("Erro ao carregar templates");
    } finally {
      setLoadingTemplates(false);
    }
  };

  // Apply template from database
  const applyDbTemplate = async (templateData: any) => {
    if (!canvas) return;
    
    try {
      // Check if template has multiple pages
      if (templateData.canvas_data.pages && Array.isArray(templateData.canvas_data.pages)) {
        // Multi-page template
        const templatePages = templateData.canvas_data.pages.map((pageData: any, index: number) => ({
          id: `template-page-${index}`,
          data: JSON.parse(JSON.stringify(pageData)), // Deep copy
        }));
        
        setPages(templatePages);
        setCurrentPageIndex(0);
        
        // Load first page
        canvas.clear();
        await canvas.loadFromJSON(templatePages[0].data);
        
        // Update canvas size
        if (templateData.canvas_data.width && templateData.canvas_data.height) {
          canvas.setWidth(templateData.canvas_data.width);
          canvas.setHeight(templateData.canvas_data.height);
          setCanvasSize({ 
            width: templateData.canvas_data.width, 
            height: templateData.canvas_data.height 
          });
        }
        
        canvas.renderAll();
        fitCanvasToScreen(canvas);
        
        // Generate thumbnails for all pages
        setTimeout(() => {
          setPages((prev) => {
            const updated = [...prev];
            updated[0] = {
              ...updated[0],
              thumbnail: canvas.toDataURL({ format: "png", quality: 0.3, multiplier: 0.15 }),
            };
            return updated;
          });
        }, 500);
        
        toast.success(`Template "${templateData.title}" com ${templatePages.length} página(s) aplicado!`);
      } else {
        // Single page template (legacy)
        canvas.clear();
        await canvas.loadFromJSON(templateData.canvas_data);
        
        // Update canvas size
        if (templateData.canvas_data.width) {
          canvas.setWidth(templateData.canvas_data.width);
          canvas.setHeight(templateData.canvas_data.height);
          setCanvasSize({ 
            width: templateData.canvas_data.width, 
            height: templateData.canvas_data.height 
          });
        }
        
        // Reset to single page
        setPages([{ id: '1', data: canvas.toJSON() }]);
        setCurrentPageIndex(0);
        
        canvas.renderAll();
        fitCanvasToScreen(canvas);
        
        toast.success(`Template "${templateData.title}" aplicado!`);
      }
    } catch (error) {
      console.error("Erro ao aplicar template:", error);
      toast.error("Erro ao aplicar template");
    }
  };

  const loadStockPhotos = async (query: string = "business") => {
    setLoadingStockPhotos(true);
    try {
      // Usando Unsplash API (você precisa criar uma conta gratuita em https://unsplash.com/developers)
      // Por ora, vou usar uma lista curada de fotos do Unsplash
      const unsplashAccessKey = "YOUR_UNSPLASH_ACCESS_KEY"; // Substituir depois
      
      // URLs diretas de fotos do Unsplash (não precisa de API key)
      const curatedPhotos = [
        { id: '1', url: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=1200', thumb: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400', author: 'Unsplash' },
        { id: '2', url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200', thumb: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400', author: 'Unsplash' },
        { id: '3', url: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1200', thumb: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=400', author: 'Unsplash' },
        { id: '4', url: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1200', thumb: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400', author: 'Unsplash' },
        { id: '5', url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200', thumb: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400', author: 'Unsplash' },
        { id: '6', url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200', thumb: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400', author: 'Unsplash' },
        { id: '7', url: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1200', thumb: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400', author: 'Unsplash' },
        { id: '8', url: 'https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?w=1200', thumb: 'https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?w=400', author: 'Unsplash' },
        { id: '9', url: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1200', thumb: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=400', author: 'Unsplash' },
        { id: '10', url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200', thumb: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400', author: 'Unsplash' },
        { id: '11', url: 'https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?w=1200', thumb: 'https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?w=400', author: 'Unsplash' },
        { id: '12', url: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=1200', thumb: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=400', author: 'Unsplash' },
        { id: '13', url: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=1200', thumb: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400', author: 'Unsplash' },
        { id: '14', url: 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=1200', thumb: 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=400', author: 'Unsplash' },
        { id: '15', url: 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=1200', thumb: 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=400', author: 'Unsplash' },
        { id: '16', url: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=1200', thumb: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=400', author: 'Unsplash' },
        { id: '17', url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200', thumb: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400', author: 'Unsplash' },
        { id: '18', url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200', thumb: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400', author: 'Unsplash' },
        { id: '19', url: 'https://images.unsplash.com/photo-1531545514256-b1400bc00f31?w=1200', thumb: 'https://images.unsplash.com/photo-1531545514256-b1400bc00f31?w=400', author: 'Unsplash' },
        { id: '20', url: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=1200', thumb: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=400', author: 'Unsplash' },
        { id: '21', url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200', thumb: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400', author: 'Unsplash' },
        { id: '22', url: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1200', thumb: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=400', author: 'Unsplash' },
        { id: '23', url: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1200', thumb: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400', author: 'Unsplash' },
        { id: '24', url: 'https://images.unsplash.com/photo-1565728744382-61accd4aa148?w=1200', thumb: 'https://images.unsplash.com/photo-1565728744382-61accd4aa148?w=400', author: 'Unsplash' },
        { id: '25', url: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=1200', thumb: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=400', author: 'Unsplash' },
        { id: '26', url: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1200', thumb: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400', author: 'Unsplash' },
        { id: '27', url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200', thumb: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400', author: 'Unsplash' },
        { id: '28', url: 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=1200', thumb: 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=400', author: 'Unsplash' },
        { id: '29', url: 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=1200', thumb: 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=400', author: 'Unsplash' },
        { id: '30', url: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200', thumb: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400', author: 'Unsplash' },
        { id: '31', url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200', thumb: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400', author: 'Unsplash' },
        { id: '32', url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200', thumb: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400', author: 'Unsplash' },
        { id: '33', url: 'https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?w=1200', thumb: 'https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?w=400', author: 'Unsplash' },
        { id: '34', url: 'https://images.unsplash.com/photo-1541746972996-4e0b0f43e02a?w=1200', thumb: 'https://images.unsplash.com/photo-1541746972996-4e0b0f43e02a?w=400', author: 'Unsplash' },
        { id: '35', url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200', thumb: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400', author: 'Unsplash' },
        { id: '36', url: 'https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?w=1200', thumb: 'https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?w=400', author: 'Unsplash' },
        { id: '37', url: 'https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?w=1200', thumb: 'https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?w=400', author: 'Unsplash' },
        { id: '38', url: 'https://images.unsplash.com/photo-1543269664-7eef42226a21?w=1200', thumb: 'https://images.unsplash.com/photo-1543269664-7eef42226a21?w=400', author: 'Unsplash' },
        { id: '39', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200', thumb: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', author: 'Unsplash' },
        { id: '40', url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=1200', thumb: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400', author: 'Unsplash' },
        { id: '41', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1200', thumb: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400', author: 'Unsplash' },
        { id: '42', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=1200', thumb: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400', author: 'Unsplash' },
        { id: '43', url: 'https://images.unsplash.com/photo-1520333789090-1afc82db536a?w=1200', thumb: 'https://images.unsplash.com/photo-1520333789090-1afc82db536a?w=400', author: 'Unsplash' },
        { id: '44', url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=1200', thumb: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400', author: 'Unsplash' },
        { id: '45', url: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=1200', thumb: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=400', author: 'Unsplash' },
        { id: '46', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=1200', thumb: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400', author: 'Unsplash' },
        { id: '47', url: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=1200', thumb: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=400', author: 'Unsplash' },
        { id: '48', url: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=1200', thumb: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400', author: 'Unsplash' },
        { id: '49', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=1200', thumb: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400', author: 'Unsplash' },
        { id: '50', url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=1200', thumb: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400', author: 'Unsplash' },
      ];
      
      setStockPhotos(curatedPhotos);
    } catch (error) {
      console.error("Erro ao carregar fotos:", error);
    } finally {
      setLoadingStockPhotos(false);
    }
  };

  const loadUserImages = async () => {
    setLoadingImages(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("user_images")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUserImages(data || []);
    } catch (error) {
      console.error("Erro ao carregar imagens:", error);
    } finally {
      setLoadingImages(false);
    }
  };

  const updatePropertiesFromObject = (obj: fabric.Object) => {
    if (!obj) return;

    setOpacity(Math.round((obj.opacity || 1) * 100));

    if (obj.type === "i-text" || obj.type === "text") {
      const textObj = obj as fabric.IText;
      setTextColor(textObj.fill as string || "#000000");
      setFontSize(textObj.fontSize || 40);
      const font = textObj.fontFamily || "Arial";
      setFontFamily(font);
      setFontSearchInput(font);
      setTextAlign(textObj.textAlign || "left");
      setFontWeight(String(textObj.fontWeight || "normal"));
      setFontStyle(textObj.fontStyle || "normal");
      setTextDecoration(textObj.underline ? "underline" : "");
    } else {
      setFillColor(obj.fill as string || "#FF6400");
      setStrokeColor(obj.stroke as string || "#000000");
      setStrokeWidth(obj.strokeWidth || 0);
    }
  };

  const loadArte = async (arteId: string, fabricCanvas: fabric.Canvas) => {
    try {
      console.log("=== LOADING ARTE ===");
      console.log("Arte ID:", arteId);
      
      const supabase = createClient();
      const { data, error } = await supabase
        .from("artes")
        .select("*")
        .eq("id", arteId)
        .single();

      console.log("Query result - data:", data);
      console.log("Query result - error:", error);

      if (error) throw error;
      if (!data) {
        toast.error("Arte não encontrada");
        return;
      }

      // Load title
      console.log("Loading title:", data.title);
      setArteTitle(data.title);

      // Load canvas size
      console.log("Canvas size:", data.width, "x", data.height);
      setCanvasSize({ width: data.width, height: data.height });
      fabricCanvas.setWidth(data.width);
      fabricCanvas.setHeight(data.height);

      console.log("Canvas data structure:", data.canvas_data);

      // Load pages (multi-page format)
      if (data.canvas_data?.pages && Array.isArray(data.canvas_data.pages)) {
        console.log("Multi-page format detected, pages:", data.canvas_data.pages.length);
        
        const loadedPages = data.canvas_data.pages.map((pageData: any, index: number) => ({
          id: `${index + 1}`,
          data: pageData,
          thumbnail: undefined // Will be generated on first render
        }));
        
        setPages(loadedPages);
        
        // Load first page or saved current page
        const pageToLoad = data.canvas_data.currentPage || 0;
        console.log("Loading page index:", pageToLoad);
        setCurrentPageIndex(pageToLoad);
        
        if (loadedPages[pageToLoad]?.data) {
          console.log("Page data exists, loading into canvas...");
          console.log("Page data:", loadedPages[pageToLoad].data);
          
          const pageDataCopy = JSON.parse(JSON.stringify(loadedPages[pageToLoad].data));
          console.log("Page data copy created");
          
          fabricCanvas.loadFromJSON(pageDataCopy)
            .then(() => {
              console.log("Canvas loaded successfully!");
              
              // Set crossOrigin for all images after loading
              fabricCanvas.getObjects().forEach((obj: any) => {
                if (obj.type === 'image' && obj._element) {
                  obj._element.crossOrigin = 'anonymous';
                }
              });
              
              fabricCanvas.renderAll();
              console.log("Canvas rendered, objects count:", fabricCanvas.getObjects().length);
              
              // Fit canvas to screen after loading
              setTimeout(() => fitCanvasToScreen(fabricCanvas), 100);
              
              // Generate thumbnail after loading (with delay to ensure images are loaded)
              setTimeout(() => {
                try {
                  const thumbnail = fabricCanvas.toDataURL({ format: 'png', quality: 0.3, multiplier: 0.2 });
                  setPages(prev => {
                    const updated = [...prev];
                    updated[pageToLoad] = { ...updated[pageToLoad], thumbnail };
                    return updated;
                  });
                } catch (error) {
                  console.error("Error generating thumbnail:", error);
                }
              }, 500);
            })
            .catch((err: any) => {
              console.error("Error loading canvas from JSON:", err);
            });
        } else {
          console.log("No page data found for index:", pageToLoad);
        }
      } else if (data.canvas_data) {
        console.log("Legacy single-page format detected");
        // Legacy format: single page (backward compatibility)
        fabricCanvas.loadFromJSON(data.canvas_data, () => {
          console.log("Legacy canvas loaded successfully!");
          fabricCanvas.renderAll();
          
          // Fit canvas to screen after loading
          setTimeout(() => fitCanvasToScreen(fabricCanvas), 100);
          
          const thumbnail = fabricCanvas.toDataURL({ format: 'png', quality: 0.3, multiplier: 0.2 });
          setPages([{ id: '1', data: data.canvas_data, thumbnail }]);
        });
      } else {
        console.log("No canvas data found!");
      }

      toast.success("Arte carregada com sucesso!");
    } catch (error) {
      console.error("Erro ao carregar arte:", error);
      toast.error("Erro ao carregar arte");
    }
  };

  const addText = () => {
    if (!canvas) return;

    const text = new fabric.IText("Clique para editar", {
      left: canvas.width! / 2 - 100,
      top: canvas.height! / 2 - 20,
      fontSize: fontSize,
      fill: textColor,
      fontFamily: fontFamily,
    });

    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
  };

  const addRectangle = () => {
    if (!canvas) return;

    const rect = new fabric.Rect({
      left: canvas.width! / 2 - 100,
      top: canvas.height! / 2 - 100,
      width: 200,
      height: 200,
      fill: fillColor,
      strokeWidth: strokeWidth,
      stroke: strokeColor,
    });

    canvas.add(rect);
    canvas.setActiveObject(rect);
    canvas.renderAll();
  };

  const addCircle = () => {
    if (!canvas) return;

    const circle = new fabric.Circle({
      left: canvas.width! / 2 - 100,
      top: canvas.height! / 2 - 100,
      radius: 100,
      fill: fillColor,
      strokeWidth: strokeWidth,
      stroke: strokeColor,
    });

    canvas.add(circle);
    canvas.setActiveObject(circle);
    canvas.renderAll();
  };

  const addImageFromFile = async () => {
    if (!canvas) return;

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Imagem muito grande! Tamanho máximo: 10MB");
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error("Por favor, selecione um arquivo de imagem válido");
        return;
      }

      try {
        // Upload to Supabase Storage
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast.error("Você precisa estar logado");
          return;
        }

        const fileName = `${user.id}/images/${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from("public-assets")
          .upload(fileName, file, {
            contentType: file.type,
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from("public-assets")
          .getPublicUrl(fileName);

        // Get image dimensions and convert to data URL to avoid CORS issues
        const img = new Image();
        const reader = new FileReader();
        
        reader.onload = async (e) => {
          const dataUrl = e.target?.result as string;
          img.src = dataUrl;
          
          await new Promise((resolve) => { img.onload = resolve; });

          // Save to database
          const { error: dbError } = await supabase
            .from("user_images")
            .insert({
              user_id: user.id,
              name: file.name,
              url: publicUrl,
              size: file.size,
              width: img.width,
              height: img.height,
            });

          if (dbError) throw dbError;

          // Add to canvas using data URL (no CORS issues)
          fabric.FabricImage.fromURL(dataUrl).then((fabricImg) => {
            const maxWidth = canvas.width! * 0.8;
            const maxHeight = canvas.height! * 0.8;
            
            // Scale to fit canvas
            const scaleX = maxWidth / (fabricImg.width || 1);
            const scaleY = maxHeight / (fabricImg.height || 1);
            const scale = Math.min(scaleX, scaleY);
            
            fabricImg.scale(scale);
            
            // Center the image
            fabricImg.set({
              left: (canvas.width! - (fabricImg.width || 0) * scale) / 2,
              top: (canvas.height! - (fabricImg.height || 0) * scale) / 2,
            });
            
            canvas.add(fabricImg);
            canvas.setActiveObject(fabricImg);
            canvas.renderAll();
            
            // Refresh layers panel
            refreshLayers(canvas);
            
            toast.success("Imagem adicionada com sucesso!");
            
            // Reload images gallery
            loadUserImages();
          }).catch((error) => {
            console.error('Erro ao carregar imagem:', error);
            toast.error("Erro ao carregar imagem");
          });
        };
        
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Erro ao fazer upload:', error);
        toast.error("Erro ao fazer upload da imagem");
      }
    };

    input.click();
  };

  const addImageFromGallery = async (imageUrl: string) => {
    if (!canvas) return;

    try {
      // Fetch image and convert to data URL to avoid CORS issues
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        
        fabric.FabricImage.fromURL(dataUrl).then((img) => {
          const maxWidth = canvas.width! * 0.8;
          const maxHeight = canvas.height! * 0.8;
          
          // Scale to fit canvas
          const scaleX = maxWidth / (img.width || 1);
          const scaleY = maxHeight / (img.height || 1);
          const scale = Math.min(scaleX, scaleY);
          
          img.scale(scale);
          
          // Center the image
          img.set({
            left: (canvas.width! - (img.width || 0) * scale) / 2,
            top: (canvas.height! - (img.height || 0) * scale) / 2,
          });
          
          canvas.add(img);
          canvas.setActiveObject(img);
          canvas.renderAll();
          
          // Refresh layers panel
          refreshLayers(canvas);
          
          toast.success("Imagem adicionada!");
        }).catch((error) => {
          console.error('Erro ao carregar imagem:', error);
          toast.error("Erro ao carregar imagem");
        });
      };
      
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error('Erro ao buscar imagem:', error);
      toast.error("Erro ao carregar imagem");
    }
  };

  const deleteSelected = () => {
    if (!canvas) return;

    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      canvas.remove(activeObject);
      canvas.renderAll();
    }
  };

  const duplicateSelected = async () => {
    if (!canvas) return;

    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      try {
        const cloned = await activeObject.clone();
        cloned.set({
          left: (cloned.left || 0) + 20,
          top: (cloned.top || 0) + 20,
        });
        canvas.add(cloned);
        canvas.setActiveObject(cloned);
        canvas.renderAll();
      } catch (error) {
        console.error('Erro ao duplicar objeto:', error);
        toast.error('Erro ao duplicar objeto');
      }
    }
  };

  const bringToFront = () => {
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      canvas.bringObjectToFront(activeObject);
      canvas.renderAll();
    }
  };

  const sendToBack = () => {
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      canvas.sendObjectToBack(activeObject);
      canvas.renderAll();
    }
  };

  // Pages management functions
  const saveCurrentPage = () => {
    if (!canvas) return;
    const pageData = JSON.parse(JSON.stringify(canvas.toJSON()));
    const newPages = [...pages];
    newPages[currentPageIndex] = { 
      ...newPages[currentPageIndex], 
      data: pageData,
      thumbnail: canvas.toDataURL({ format: 'png', quality: 0.3, multiplier: 0.2 })
    };
    setPages(newPages);
    return newPages; // Retorna as páginas atualizadas
  };

  const loadPage = (index: number) => {
    if (!canvas || index < 0 || index >= pages.length) return;
    
    // Save current page before switching and get updated pages
    const updatedPages = saveCurrentPage();
    const pagesToUse = updatedPages || pages;
    
    setCurrentPageIndex(index);
    const pageData = pagesToUse[index].data;
    
    if (pageData) {
      canvas.clear();
      // Create a deep copy before loading to prevent reference issues
      const pageDataCopy = JSON.parse(JSON.stringify(pageData));
      canvas.loadFromJSON(pageDataCopy, () => {
        canvas.renderAll();
        canvas.requestRenderAll();
      });
    } else {
      canvas.clear();
      canvas.backgroundColor = '#ffffff';
      canvas.renderAll();
    }
  };

  const addNewPage = () => {
    if (!canvas) return;
    
    // Save current page state immediately
    const currentPageData = JSON.parse(JSON.stringify(canvas.toJSON()));
    const currentThumbnail = canvas.toDataURL({ format: 'png', quality: 0.3, multiplier: 0.2 });
    
    setPages(prevPages => {
      const newPages = [...prevPages];
      // Update current page
      newPages[currentPageIndex] = {
        ...newPages[currentPageIndex],
        data: currentPageData,
        thumbnail: currentThumbnail
      };
      // Add new empty page
      const newPage = { id: Date.now().toString(), data: null };
      newPages.push(newPage);
      return newPages;
    });
    
    // Update index and clear canvas
    setCurrentPageIndex(pages.length);
    canvas.clear();
    canvas.backgroundColor = '#ffffff';
    canvas.renderAll();
    
    toast.success('Nova página adicionada!');
  };

  const duplicatePage = (index: number) => {
    if (!canvas) return;
    
    // Save current page state
    const currentPageData = JSON.parse(JSON.stringify(canvas.toJSON()));
    const currentThumbnail = canvas.toDataURL({ format: 'png', quality: 0.3, multiplier: 0.2 });
    
    setPages(prevPages => {
      const newPages = [...prevPages];
      // Update current page
      newPages[currentPageIndex] = {
        ...newPages[currentPageIndex],
        data: currentPageData,
        thumbnail: currentThumbnail
      };
      
      const pageToDuplicate = newPages[index];
      const newPage = { 
        id: Date.now().toString(), 
        data: pageToDuplicate.data ? JSON.parse(JSON.stringify(pageToDuplicate.data)) : null,
        thumbnail: pageToDuplicate.thumbnail
      };
      newPages.splice(index + 1, 0, newPage);
      return newPages;
    });
    
    toast.success('Página duplicada!');
  };

  const deletePage = (index: number) => {
    if (pages.length === 1) {
      toast.error('Você precisa ter pelo menos uma página!');
      return;
    }
    
    if (!canvas) return;
    
    const newPages = pages.filter((_, i) => i !== index);
    setPages(newPages);
    
    if (currentPageIndex === index) {
      const newIndex = Math.max(0, index - 1);
      setCurrentPageIndex(newIndex);
      
      // Load the new current page immediately
      const pageData = newPages[newIndex].data;
      if (pageData) {
        canvas.clear();
        const pageDataCopy = JSON.parse(JSON.stringify(pageData));
        canvas.loadFromJSON(pageDataCopy, () => {
          canvas.renderAll();
        });
      } else {
        canvas.clear();
        canvas.backgroundColor = '#ffffff';
        canvas.renderAll();
      }
    } else if (currentPageIndex > index) {
      setCurrentPageIndex(currentPageIndex - 1);
    }
    
    toast.success('Página deletada!');
  };

  const handleZoomIn = () => {
    if (!canvas) return;
    const newZoom = Math.min(zoom + 0.1, 3);
    canvas.setZoom(newZoom);
    setZoom(newZoom);
  };

  const handleZoomOut = () => {
    if (!canvas) return;
    const newZoom = Math.max(zoom - 0.1, 0.1);
    canvas.setZoom(newZoom);
    setZoom(newZoom);
  };

  const resetZoom = () => {
    if (!canvas) return;
    canvas.setZoom(1);
    setZoom(1);
  };

  // Update selected object properties
  const updateTextColor = (color: string) => {
    if (!canvas || !selectedObject) return;
    setTextColor(color);
    selectedObject.set("fill", color);
    canvas.renderAll();
  };

  const updateFontSize = (size: number) => {
    if (!canvas || !selectedObject || selectedObject.type !== "i-text") return;
    setFontSize(size);
    (selectedObject as fabric.IText).set("fontSize", size);
    canvas.renderAll();
  };

  const updateFontFamily = (family: string) => {
    if (!canvas || !selectedObject || selectedObject.type !== "i-text") return;
    setFontFamily(family);
    (selectedObject as fabric.IText).set("fontFamily", family);
    canvas.renderAll();
  };

  const updateTextAlign = (align: string) => {
    if (!canvas || !selectedObject || selectedObject.type !== "i-text") return;
    setTextAlign(align);
    (selectedObject as fabric.IText).set("textAlign", align);
    canvas.renderAll();
  };

  const toggleBold = () => {
    if (!canvas || !selectedObject || selectedObject.type !== "i-text") return;
    const newWeight = fontWeight === "bold" ? "normal" : "bold";
    setFontWeight(newWeight);
    (selectedObject as fabric.IText).set("fontWeight", newWeight);
    canvas.renderAll();
  };

  const toggleItalic = () => {
    if (!canvas || !selectedObject || selectedObject.type !== "i-text") return;
    const newStyle = fontStyle === "italic" ? "normal" : "italic";
    setFontStyle(newStyle);
    (selectedObject as fabric.IText).set("fontStyle", newStyle);
    canvas.renderAll();
  };

  const toggleUnderline = () => {
    if (!canvas || !selectedObject || selectedObject.type !== "i-text") return;
    const newDecoration = textDecoration === "underline" ? "" : "underline";
    setTextDecoration(newDecoration);
    (selectedObject as fabric.IText).set("underline", newDecoration === "underline");
    canvas.renderAll();
  };

  const updateFillColor = (color: string) => {
    if (!canvas || !selectedObject) return;
    setFillColor(color);
    selectedObject.set("fill", color);
    canvas.renderAll();
  };

  const updateStrokeColor = (color: string) => {
    if (!canvas || !selectedObject) return;
    setStrokeColor(color);
    selectedObject.set("stroke", color);
    canvas.renderAll();
  };

  const updateStrokeWidth = (width: number) => {
    if (!canvas || !selectedObject) return;
    setStrokeWidth(width);
    selectedObject.set("strokeWidth", width);
    canvas.renderAll();
  };

  const updateOpacity = (value: number) => {
    if (!canvas || !selectedObject) return;
    setOpacity(value);
    selectedObject.set("opacity", value / 100);
    canvas.renderAll();
  };

  const saveArte = async () => {
    if (!canvas) return;

    setSaving(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Você precisa estar logado");
        return;
      }

      // Check if editing existing arte
      const arteId = searchParams.get("arte");
      const isEditing = !!arteId;

      // Only check limits for new artes
      if (!isEditing) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("artes_used, artes_limit")
          .eq("id", user.id)
          .single();

        if (profile && profile.artes_used >= profile.artes_limit) {
          toast.error("Você atingiu o limite de artes do seu plano!");
          return;
        }
      }

      // Save current page before saving the arte
      saveCurrentPage();

      // Save all pages data
      const allPagesData = pages.map(page => page.data);

      // Get canvas data for the first page as preview
      const dataURL = canvas.toDataURL({
        format: "png",
        quality: 1,
        multiplier: 1
      });

      // Convert data URL to blob
      const blob = await fetch(dataURL).then((r) => r.blob());

      // Upload image to Supabase Storage
      const fileName = `${user.id}/${Date.now()}.png`;
      const { error: uploadError } = await supabase.storage
        .from("public-assets")
        .upload(fileName, blob, {
          contentType: "image/png",
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("public-assets").getPublicUrl(fileName);

      const arteData = {
        user_id: user.id,
        title: arteTitle,
        image_url: publicUrl,
        canvas_data: { pages: allPagesData, currentPage: currentPageIndex },
        width: canvasSize.width,
        height: canvasSize.height,
      };

      if (isEditing) {
        // UPDATE existing arte
        const { error: updateError } = await supabase
          .from("artes")
          .update(arteData)
          .eq("id", arteId);

        if (updateError) throw updateError;
        toast.success("Arte atualizada com sucesso!");
      } else {
        // INSERT new arte
        const { error: insertError } = await supabase
          .from("artes")
          .insert(arteData);

        if (insertError) throw insertError;

        // Update artes_used count only for new artes
        const { data: profile } = await supabase
          .from("profiles")
          .select("artes_used")
          .eq("id", user.id)
          .single();

        await supabase
          .from("profiles")
          .update({ artes_used: (profile?.artes_used || 0) + 1 })
          .eq("id", user.id);

        toast.success("Arte salva com sucesso!");
      }

      router.push("/dashboard");
    } catch (error) {
      console.error("Erro ao salvar arte:", error);
      toast.error("Erro ao salvar arte");
    } finally {
      setSaving(false);
    }
  };

  const downloadArte = () => {
    if (!canvas) return;

    // Save current page before downloading
    saveCurrentPage();

    // Download all pages
    pages.forEach((page, index) => {
      if (page.data) {
        // Temporarily load each page to export
        const tempCanvas = new fabric.Canvas(null as any);
        tempCanvas.setWidth(canvasSize.width);
        tempCanvas.setHeight(canvasSize.height);
        
        tempCanvas.loadFromJSON(page.data, () => {
          const dataURL = tempCanvas.toDataURL({
            format: "png",
            quality: 1,
            multiplier: 1
          });

          const link = document.createElement("a");
          link.download = `${arteTitle}_pagina_${index + 1}.png`;
          link.href = dataURL;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          tempCanvas.dispose();
        });
      }
    });

    toast.success(`${pages.length} página(s) exportada(s)!`);
  };

  const applyTemplate = (type: "post" | "story" | "square") => {
    if (!canvas) return;

    canvas.clear();

    if (type === "post") {
      canvas.setWidth(1080);
      canvas.setHeight(1080);
      canvas.backgroundColor = "#FF6400";
      setCanvasSize({ width: 1080, height: 1080 });
    } else if (type === "story") {
      canvas.setWidth(1080);
      canvas.setHeight(1920);
      canvas.backgroundColor = "#000000";
      setCanvasSize({ width: 1080, height: 1920 });
    } else if (type === "square") {
      canvas.setWidth(1200);
      canvas.setHeight(1200);
      canvas.backgroundColor = "#FFFFFF";
      setCanvasSize({ width: 1200, height: 1200 });
    }

    // Add template text
    const text = new fabric.IText("Seu Texto Aqui", {
      left: canvas.width! / 2 - 100,
      top: canvas.height! / 2 - 30,
      fontSize: 60,
      fill: type === "story" ? "#FFFFFF" : "#FFFFFF",
      fontFamily: "Arial",
      fontWeight: "bold",
    });

    canvas.add(text);
    canvas.renderAll();
  };

  const applyPrebuiltTemplate = (templateType: string) => {
    if (!canvas) return;
    
    canvas.clear();
    canvas.setWidth(1080);
    canvas.setHeight(1080);
    setCanvasSize({ width: 1080, height: 1080 });

    // ========== ANIVERSÁRIO E CELEBRAÇÕES ==========
    
    // Aniversário Festa
    if (templateType === 'birthday-party') {
      canvas.backgroundColor = '#FEF3C7';
      
      const confetti1 = new fabric.Circle({
        left: 100,
        top: 50,
        radius: 30,
        fill: '#F59E0B',
        selectable: false,
      });
      
      const confetti2 = new fabric.Circle({
        left: 850,
        top: 120,
        radius: 25,
        fill: '#EF4444',
        selectable: false,
      });
      
      const confetti3 = new fabric.Circle({
        left: 950,
        top: 900,
        radius: 35,
        fill: '#8B5CF6',
        selectable: false,
      });
      
      const title = new fabric.IText('FELIZ\nANIVERSÁRIO!', {
        left: 540,
        top: 300,
        fontSize: 110,
        fill: '#DC2626',
        fontFamily: 'Impact',
        fontWeight: 'bold',
        textAlign: 'center',
        originX: 'center',
        originY: 'center',
        shadow: 'rgba(0,0,0,0.2) 3px 3px 10px',
      });
      
      const subtitle = new fabric.IText('Parabéns, [NOME]!', {
        left: 540,
        top: 550,
        fontSize: 48,
        fill: '#92400E',
        fontFamily: 'Arial',
        fontWeight: 'bold',
        textAlign: 'center',
        originX: 'center',
        originY: 'center',
      });
      
      const message = new fabric.IText('Desejamos muita alegria\ne realizações! 🎉', {
        left: 540,
        top: 700,
        fontSize: 36,
        fill: '#78350F',
        fontFamily: 'Arial',
        textAlign: 'center',
        originX: 'center',
        originY: 'center',
        lineHeight: 1.4,
      });
      
      canvas.add(confetti1, confetti2, confetti3, title, subtitle, message);
    }
    
    // Aniversário de Empresa
    else if (templateType === 'company-anniversary') {
      canvas.backgroundColor = '#1E3A8A';
      
      const badge = new fabric.Circle({
        left: 540,
        top: 250,
        radius: 180,
        fill: '#FFFFFF',
        stroke: '#FCD34D',
        strokeWidth: 15,
        originX: 'center',
        originY: 'center',
        selectable: false,
      });
      
      const years = new fabric.IText('5', {
        left: 540,
        top: 200,
        fontSize: 160,
        fill: '#1E3A8A',
        fontFamily: 'Impact',
        fontWeight: 'bold',
        textAlign: 'center',
        originX: 'center',
        originY: 'center',
      });
      
      const yearsText = new fabric.IText('ANOS', {
        left: 540,
        top: 300,
        fontSize: 42,
        fill: '#1E40AF',
        fontFamily: 'Arial',
        fontWeight: 'bold',
        textAlign: 'center',
        originX: 'center',
        originY: 'center',
      });
      
      const title = new fabric.IText('DE SUCESSO!', {
        left: 540,
        top: 520,
        fontSize: 82,
        fill: '#FFFFFF',
        fontFamily: 'Impact',
        fontWeight: 'bold',
        textAlign: 'center',
        originX: 'center',
        originY: 'center',
      });
      
      const subtitle = new fabric.IText('Obrigado por fazer parte\ndessa história!', {
        left: 540,
        top: 720,
        fontSize: 38,
        fill: '#DBEAFE',
        fontFamily: 'Arial',
        textAlign: 'center',
        originX: 'center',
        originY: 'center',
        lineHeight: 1.4,
      });
      
      canvas.add(badge, years, yearsText, title, subtitle);
    }
    
    // ========== PROMOÇÕES E VENDAS ==========
    
    // Black Friday
    else if (templateType === 'black-friday') {
      canvas.backgroundColor = '#000000';
      
      const redStripe = new fabric.Rect({
        left: 0,
        top: 280,
        width: 1080,
        height: 520,
        fill: '#DC2626',
        selectable: false,
      });
      
      const title = new fabric.IText('BLACK\nFRIDAY', {
        left: 540,
        top: 200,
        fontSize: 115,
        fill: '#FFFFFF',
        fontFamily: 'Impact',
        fontWeight: 'bold',
        textAlign: 'center',
        originX: 'center',
        originY: 'center',
        lineHeight: 0.9,
        shadow: 'rgba(255,255,255,0.3) 0px 0px 30px',
      });
      
      const discount = new fabric.IText('ATÉ 70% OFF', {
        left: 540,
        top: 500,
        fontSize: 95,
        fill: '#FEF08A',
        fontFamily: 'Impact',
        fontWeight: 'bold',
        textAlign: 'center',
        originX: 'center',
        originY: 'center',
        stroke: '#000000',
        strokeWidth: 3,
      });
      
      const cta = new fabric.IText('APROVEITE AGORA!', {
        left: 540,
        top: 850,
        fontSize: 44,
        fill: '#FFFFFF',
        fontFamily: 'Arial',
        fontWeight: 'bold',
        textAlign: 'center',
        originX: 'center',
        originY: 'center',
      });
      
      canvas.add(redStripe, title, discount, cta);
    }
    
    // Promoção com Desconto
    else if (templateType === 'discount-promo') {
      canvas.backgroundColor = '#EF4444';
      
      const whiteBox = new fabric.Rect({
        left: 540,
        top: 540,
        width: 880,
        height: 700,
        fill: '#FFFFFF',
        rx: 40,
        ry: 40,
        originX: 'center',
        originY: 'center',
        shadow: 'rgba(0,0,0,0.3) 0px 15px 50px',
      });
      
      const badge = new fabric.Circle({
        left: 540,
        top: 200,
        radius: 140,
        fill: '#FEF08A',
        stroke: '#FFFFFF',
        strokeWidth: 12,
        originX: 'center',
        originY: 'center',
        shadow: 'rgba(0,0,0,0.3) 0px 10px 30px',
      });
      
      const percent = new fabric.IText('50%', {
        left: 540,
        top: 180,
        fontSize: 105,
        fill: '#DC2626',
        fontFamily: 'Impact',
        fontWeight: 'bold',
        textAlign: 'center',
        originX: 'center',
        originY: 'center',
      });
      
      const off = new fabric.IText('OFF', {
        left: 540,
        top: 270,
        fontSize: 42,
        fill: '#991B1B',
        fontFamily: 'Arial',
        fontWeight: 'bold',
        textAlign: 'center',
        originX: 'center',
        originY: 'center',
      });
      
      const title = new fabric.IText('SUPER PROMOÇÃO!', {
        left: 540,
        top: 470,
        fontSize: 68,
        fill: '#1F2937',
        fontFamily: 'Impact',
        fontWeight: 'bold',
        textAlign: 'center',
        originX: 'center',
        originY: 'center',
      });
      
      const subtitle = new fabric.IText('Em produtos selecionados', {
        left: 540,
        top: 580,
        fontSize: 36,
        fill: '#6B7280',
        fontFamily: 'Arial',
        textAlign: 'center',
        originX: 'center',
        originY: 'center',
      });
      
      const validity = new fabric.Rect({
        left: 540,
        top: 740,
        width: 580,
        height: 90,
        fill: '#FEE2E2',
        rx: 15,
        ry: 15,
        originX: 'center',
        originY: 'center',
      });
      
      const validityText = new fabric.IText('Válido até 31/12', {
        left: 540,
        top: 740,
        fontSize: 38,
        fill: '#991B1B',
        fontFamily: 'Arial',
        fontWeight: 'bold',
        textAlign: 'center',
        originX: 'center',
        originY: 'center',
      });
      
      canvas.add(whiteBox, badge, percent, off, title, subtitle, validity, validityText);
    }
    
    // Queima de Estoque
    else if (templateType === 'clearance-sale') {
      canvas.backgroundColor = '#FF6B00';
      
      const title = new fabric.IText('QUEIMA DE\nESTOQUE', {
        left: 540,
        top: 250,
        fontSize: 100,
        fill: '#FFFFFF',
        fontFamily: 'Impact',
        fontWeight: 'bold',
        textAlign: 'center',
        originX: 'center',
        originY: 'center',
        lineHeight: 1,
        shadow: 'rgba(0,0,0,0.4) 5px 5px 15px',
      });
      
      const flashBox = new fabric.Rect({
        left: 540,
        top: 540,
        width: 900,
        height: 240,
        fill: '#FEF08A',
        rx: 20,
        ry: 20,
        originX: 'center',
        originY: 'center',
        shadow: 'rgba(0,0,0,0.3) 0px 10px 40px',
      });
      
      const discount = new fabric.IText('ATÉ 80% DE DESCONTO', {
        left: 540,
        top: 540,
        fontSize: 62,
        fill: '#DC2626',
        fontFamily: 'Impact',
        fontWeight: 'bold',
        textAlign: 'center',
        originX: 'center',
        originY: 'center',
      });
      
      const cta = new fabric.IText('🔥 ÚLTIMAS UNIDADES 🔥', {
        left: 540,
        top: 800,
        fontSize: 46,
        fill: '#FFFFFF',
        fontFamily: 'Arial',
        fontWeight: 'bold',
        textAlign: 'center',
        originX: 'center',
        originY: 'center',
      });
      
      canvas.add(title, flashBox, discount, cta);
    }
    
    // ========== VAGAS DE EMPREGO ==========
    
    // Estamos Contratando
    else if (templateType === 'hiring-modern') {
      canvas.backgroundColor = '#0F172A';
      
      const accentBar = new fabric.Rect({
        left: 0,
        top: 0,
        width: 30,
        height: 1080,
        fill: '#22D3EE',
        selectable: false,
      });
      
      const title = new fabric.IText('ESTAMOS\nCONTRATANDO', {
        left: 120,
        top: 180,
        fontSize: 92,
        fill: '#FFFFFF',
        fontFamily: 'Impact',
        fontWeight: 'bold',
        lineHeight: 1,
      });
      
      const position = new fabric.IText('Desenvolvedor Full Stack', {
        left: 120,
        top: 420,
        fontSize: 48,
        fill: '#22D3EE',
        fontFamily: 'Arial',
        fontWeight: 'bold',
      });
      
      const requirement1 = new fabric.IText('✓ Experiência com React/Node', {
        left: 120,
        top: 550,
        fontSize: 32,
        fill: '#94A3B8',
        fontFamily: 'Arial',
      });
      
      const requirement2 = new fabric.IText('✓ Conhecimento em AWS', {
        left: 120,
        top: 610,
        fontSize: 32,
        fill: '#94A3B8',
        fontFamily: 'Arial',
      });
      
      const requirement3 = new fabric.IText('✓ Inglês intermediário', {
        left: 120,
        top: 670,
        fontSize: 32,
        fill: '#94A3B8',
        fontFamily: 'Arial',
      });
      
      const ctaBox = new fabric.Rect({
        left: 120,
        top: 830,
        width: 450,
        height: 100,
        fill: '#22D3EE',
        rx: 15,
        ry: 15,
      });
      
      const ctaText = new fabric.IText('CANDIDATE-SE AGORA', {
        left: 345,
        top: 880,
        fontSize: 32,
        fill: '#0F172A',
        fontFamily: 'Arial',
        fontWeight: 'bold',
        textAlign: 'center',
        originX: 'center',
        originY: 'center',
      });
      
      canvas.add(accentBar, title, position, requirement1, requirement2, requirement3, ctaBox, ctaText);
    }
    
    // Vaga com Benefícios
    else if (templateType === 'job-benefits') {
      canvas.backgroundColor = '#6366F1';
      
      const topSection = new fabric.Rect({
        left: 0,
        top: 0,
        width: 1080,
        height: 450,
        fill: '#4F46E5',
        selectable: false,
      });
      
      const title = new fabric.IText('FAÇA PARTE DO\nNOSSO TIME!', {
        left: 540,
        top: 200,
        fontSize: 78,
        fill: '#FFFFFF',
        fontFamily: 'Impact',
        fontWeight: 'bold',
        textAlign: 'center',
        originX: 'center',
        originY: 'center',
        lineHeight: 1.1,
      });
      
      const position = new fabric.IText('Analista de Marketing', {
        left: 540,
        top: 520,
        fontSize: 52,
        fill: '#FFFFFF',
        fontFamily: 'Arial',
        fontWeight: 'bold',
        textAlign: 'center',
        originX: 'center',
        originY: 'center',
      });
      
      const benefit1 = new fabric.IText('💰 Salário Competitivo', {
        left: 540,
        top: 650,
        fontSize: 36,
        fill: '#E0E7FF',
        fontFamily: 'Arial',
        textAlign: 'center',
        originX: 'center',
        originY: 'center',
      });
      
      const benefit2 = new fabric.IText('🏠 Home Office', {
        left: 540,
        top: 720,
        fontSize: 36,
        fill: '#E0E7FF',
        fontFamily: 'Arial',
        textAlign: 'center',
        originX: 'center',
        originY: 'center',
      });
      
      const benefit3 = new fabric.IText('📚 Plano de Carreira', {
        left: 540,
        top: 790,
        fontSize: 36,
        fill: '#E0E7FF',
        fontFamily: 'Arial',
        textAlign: 'center',
        originX: 'center',
        originY: 'center',
      });
      
      const cta = new fabric.IText('Envie seu currículo!', {
        left: 540,
        top: 920,
        fontSize: 42,
        fill: '#FEF08A',
        fontFamily: 'Arial',
        fontWeight: 'bold',
        textAlign: 'center',
        originX: 'center',
        originY: 'center',
      });
      
      canvas.add(topSection, title, position, benefit1, benefit2, benefit3, cta);
    }
    
    // ========== DICAS E EDUCACIONAL ==========
    
    // Dica do Dia
    else if (templateType === 'tip-of-day') {
      canvas.backgroundColor = '#ECFDF5';
      
      const badge = new fabric.Rect({
        left: 80,
        top: 80,
        width: 200,
        height: 70,
        fill: '#10B981',
        rx: 35,
        ry: 35,
      });
      
      const badgeText = new fabric.IText('DICA', {
        left: 180,
        top: 115,
        fontSize: 38,
        fill: '#FFFFFF',
        fontFamily: 'Arial',
        fontWeight: 'bold',
        textAlign: 'center',
        originX: 'center',
        originY: 'center',
      });
      
      const title = new fabric.IText('Como aumentar suas\nvendas online', {
        left: 540,
        top: 320,
        fontSize: 68,
        fill: '#065F46',
        fontFamily: 'Arial',
        fontWeight: 'bold',
        textAlign: 'center',
        originX: 'center',
        originY: 'center',
        lineHeight: 1.2,
      });
      
      const tip = new fabric.IText('1. Invista em boas fotos\n2. Responda rápido\n3. Ofereça frete grátis', {
        left: 540,
        top: 600,
        fontSize: 42,
        fill: '#047857',
        fontFamily: 'Arial',
        textAlign: 'center',
        originX: 'center',
        originY: 'center',
        lineHeight: 1.6,
      });
      
      const hashtag = new fabric.IText('#DicaDoEspecialista', {
        left: 540,
        top: 920,
        fontSize: 32,
        fill: '#10B981',
        fontFamily: 'Arial',
        fontWeight: 'bold',
        textAlign: 'center',
        originX: 'center',
        originY: 'center',
      });
      
      canvas.add(badge, badgeText, title, tip, hashtag);
    }
    
    // Tutorial Passo a Passo
    else if (templateType === 'step-tutorial') {
      canvas.backgroundColor = '#FFFFFF';
      
      const header = new fabric.Rect({
        left: 0,
        top: 0,
        width: 1080,
        height: 200,
        fill: '#8B5CF6',
        selectable: false,
      });
      
      const title = new fabric.IText('PASSO A PASSO', {
        left: 540,
        top: 100,
        fontSize: 72,
        fill: '#FFFFFF',
        fontFamily: 'Impact',
        fontWeight: 'bold',
        textAlign: 'center',
        originX: 'center',
        originY: 'center',
      });
      
      const step1Circle = new fabric.Circle({
        left: 120,
        top: 320,
        radius: 50,
        fill: '#A78BFA',
      });
      
      const step1Number = new fabric.IText('1', {
        left: 170,
        top: 370,
        fontSize: 48,
        fill: '#FFFFFF',
        fontFamily: 'Arial',
        fontWeight: 'bold',
        textAlign: 'center',
        originX: 'center',
        originY: 'center',
      });
      
      const step1Text = new fabric.IText('Primeiro passo aqui', {
        left: 250,
        top: 345,
        fontSize: 38,
        fill: '#1F2937',
        fontFamily: 'Arial',
        fontWeight: 'bold',
      });
      
      const step2Circle = new fabric.Circle({
        left: 120,
        top: 500,
        radius: 50,
        fill: '#A78BFA',
      });
      
      const step2Number = new fabric.IText('2', {
        left: 170,
        top: 550,
        fontSize: 48,
        fill: '#FFFFFF',
        fontFamily: 'Arial',
        fontWeight: 'bold',
        textAlign: 'center',
        originX: 'center',
        originY: 'center',
      });
      
      const step2Text = new fabric.IText('Segundo passo aqui', {
        left: 250,
        top: 525,
        fontSize: 38,
        fill: '#1F2937',
        fontFamily: 'Arial',
        fontWeight: 'bold',
      });
      
      const step3Circle = new fabric.Circle({
        left: 120,
        top: 680,
        radius: 50,
        fill: '#A78BFA',
      });
      
      const step3Number = new fabric.IText('3', {
        left: 170,
        top: 730,
        fontSize: 48,
        fill: '#FFFFFF',
        fontFamily: 'Arial',
        fontWeight: 'bold',
        textAlign: 'center',
        originX: 'center',
        originY: 'center',
      });
      
      const step3Text = new fabric.IText('Terceiro passo aqui', {
        left: 250,
        top: 705,
        fontSize: 38,
        fill: '#1F2937',
        fontFamily: 'Arial',
        fontWeight: 'bold',
      });
      
      canvas.add(header, title, step1Circle, step1Number, step1Text, step2Circle, step2Number, step2Text, step3Circle, step3Number, step3Text);
    }
    
    // ========== FRASES MOTIVACIONAIS ==========
    
    // Frase Inspiradora
    else if (templateType === 'motivational-quote') {
      canvas.backgroundColor = '#1F2937';
      
      const quote = new fabric.IText('"O sucesso é a soma\nde pequenos esforços\nrepetidos dia após dia"', {
        left: 540,
        top: 400,
        fontSize: 62,
        fill: '#FFFFFF',
        fontFamily: 'Georgia',
        fontStyle: 'italic',
        textAlign: 'center',
        originX: 'center',
        originY: 'center',
        lineHeight: 1.4,
      });
      
      const author = new fabric.IText('- Robert Collier', {
        left: 540,
        top: 720,
        fontSize: 38,
        fill: '#FCD34D',
        fontFamily: 'Arial',
        textAlign: 'center',
        originX: 'center',
        originY: 'center',
      });
      
      const decorLine1 = new fabric.Rect({
        left: 200,
        top: 270,
        width: 150,
        height: 4,
        fill: '#FCD34D',
        selectable: false,
      });
      
      const decorLine2 = new fabric.Rect({
        left: 730,
        top: 270,
        width: 150,
        height: 4,
        fill: '#FCD34D',
        selectable: false,
      });
      
      canvas.add(decorLine1, decorLine2, quote, author);
    }
    
    // ========== TEMPLATES ORIGINAIS (mantidos) ==========
    
    // Template 1: Negócios Moderno
    else if (templateType === 'business-blue') {
      canvas.backgroundColor = '#0F172A';
      
      // Decorative shapes
      const shape1 = new fabric.Rect({
        left: -50,
        top: 100,
        width: 400,
        height: 400,
        fill: '#3B82F6',
        angle: 45,
        opacity: 0.3,
        selectable: false,
      });
      
      const shape2 = new fabric.Rect({
        left: 700,
        top: 600,
        width: 350,
        height: 350,
        fill: '#60A5FA',
        angle: 30,
        opacity: 0.2,
        selectable: false,
      });
      
      const title = new fabric.IText('FAÇA SEU\nNEGÓCIO\nCRESCER', {
        left: 80,
        top: 200,
        fontSize: 88,
        fill: '#FFFFFF',
        fontFamily: 'Impact',
        fontWeight: 'bold',
        lineHeight: 1.1,
        shadow: 'rgba(0,0,0,0.3) 5px 5px 10px',
      });
      
      const subtitle = new fabric.IText('Soluções digitais para sua empresa', {
        left: 80,
        top: 550,
        fontSize: 32,
        fill: '#3B82F6',
        fontFamily: 'Arial',
        fontWeight: 'bold',
      });
      
      canvas.add(shape1, shape2, title, subtitle);
    }
    // Template 2: Marketing Digital
    else if (templateType === 'marketing-purple') {
      canvas.backgroundColor = '#6B21A8';
      
      // Gradient effect background
      const bgRect = new fabric.Rect({
        left: 0,
        top: 0,
        width: 1080,
        height: 540,
        fill: '#7C3AED',
        selectable: false,
      });
      
      const title = new fabric.IText('MARKETING\nDIGITAL', {
        left: 80,
        top: 150,
        fontSize: 92,
        fill: '#FFFFFF',
        fontFamily: 'Impact',
        fontWeight: 'bold',
        lineHeight: 1,
      });
      
      const subtitle = new fabric.IText('Aumente suas vendas online', {
        left: 80,
        top: 400,
        fontSize: 36,
        fill: '#E9D5FF',
        fontFamily: 'Arial',
        fontWeight: 'bold',
      });
      
      const cta = new fabric.Rect({
        left: 80,
        top: 680,
        width: 350,
        height: 90,
        fill: '#FFFFFF',
        rx: 45,
        ry: 45,
      });
      
      const ctaText = new fabric.IText('COMEÇAR AGORA', {
        left: 130,
        top: 708,
        fontSize: 28,
        fill: '#7C3AED',
        fontFamily: 'Arial',
        fontWeight: 'bold',
      });
      
      canvas.add(bgRect, title, subtitle, cta, ctaText);
    }
    // Template 3: Redes Sociais
    else if (templateType === 'social-red') {
      canvas.backgroundColor = '#F43F5E';
      
      // Circle decoration
      const circle = new fabric.Circle({
        left: 650,
        top: 150,
        radius: 200,
        fill: '#FFFFFF',
        opacity: 0.15,
        selectable: false,
      });
      
      const badge = new fabric.Rect({
        left: 80,
        top: 450,
        width: 320,
        height: 160,
        fill: '#FFFFFF',
        rx: 20,
        ry: 20,
        shadow: 'rgba(0,0,0,0.2) 0px 10px 30px',
      });
      
      const number = new fabric.IText('50K+', {
        left: 130,
        top: 475,
        fontSize: 82,
        fill: '#F43F5E',
        fontFamily: 'Impact',
        fontWeight: 'bold',
      });
      
      const text = new fabric.IText('SEGUIDORES', {
        left: 130,
        top: 560,
        fontSize: 28,
        fill: '#991B1B',
        fontFamily: 'Arial',
        fontWeight: 'bold',
      });
      
      const title = new fabric.IText('CRESÇA NAS\nREDES SOCIAIS', {
        left: 80,
        top: 120,
        fontSize: 68,
        fill: '#FFFFFF',
        fontFamily: 'Impact',
        fontWeight: 'bold',
        lineHeight: 1.1,
      });
      
      canvas.add(circle, title, badge, number, text);
    }
    // Template 4: Gastronomia
    else if (templateType === 'food-green') {
      canvas.backgroundColor = '#15803D';
      
      // Decorative circle
      const decorCircle = new fabric.Circle({
        left: 700,
        top: -100,
        radius: 300,
        fill: '#22C55E',
        opacity: 0.3,
        selectable: false,
      });
      
      const title = new fabric.IText('RECEITA\nDELICIOSA', {
        left: 80,
        top: 180,
        fontSize: 96,
        fill: '#FFFFFF',
        fontFamily: 'Impact',
        fontWeight: 'bold',
        lineHeight: 0.95,
        shadow: 'rgba(0,0,0,0.3) 3px 3px 8px',
      });
      
      const subtitle = new fabric.IText('Simples e rápida de fazer', {
        left: 80,
        top: 420,
        fontSize: 38,
        fill: '#BBF7D0',
        fontFamily: 'Arial',
        fontWeight: 'bold',
      });
      
      const tag = new fabric.Rect({
        left: 80,
        top: 650,
        width: 200,
        height: 60,
        fill: '#FFFFFF',
        rx: 30,
        ry: 30,
      });
      
      const tagText = new fabric.IText('VER RECEITA', {
        left: 107,
        top: 668,
        fontSize: 22,
        fill: '#15803D',
        fontFamily: 'Arial',
        fontWeight: 'bold',
      });
      
      canvas.add(decorCircle, title, subtitle, tag, tagText);
    }
    // Template 5: Abstrato Moderno
    else if (templateType === 'abstract-bg') {
      canvas.backgroundColor = '#1E1B4B';
      
      // Modern gradient circles
      const circle1 = new fabric.Circle({
        left: -100,
        top: -100,
        radius: 400,
        fill: '#F43F5E',
        opacity: 0.5,
        selectable: false,
      });
      
      const circle2 = new fabric.Circle({
        left: 500,
        top: 200,
        radius: 380,
        fill: '#A855F7',
        opacity: 0.5,
        selectable: false,
      });
      
      const circle3 = new fabric.Circle({
        left: 150,
        top: 650,
        radius: 350,
        fill: '#3B82F6',
        opacity: 0.5,
        selectable: false,
      });
      
      const title = new fabric.IText('SEU TEXTO\nAQUI', {
        left: 540,
        top: 420,
        fontSize: 88,
        fill: '#FFFFFF',
        fontFamily: 'Impact',
        fontWeight: 'bold',
        textAlign: 'center',
        originX: 'center',
        originY: 'center',
        shadow: 'rgba(0,0,0,0.5) 0px 5px 20px',
      });
      
      canvas.add(circle1, circle2, circle3, title);
    }

    canvas.renderAll();
    toast.success('Template aplicado! Clique para editar os elementos.');
  };

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      {/* Top Header - Canva Style */}
      <header className="bg-gradient-to-r from-[#00C4CC] to-[#7C3AED] flex items-center justify-between px-6 py-3 shrink-0">
        <div className="flex items-center gap-6">
          <h1 className="text-3xl font-bold text-white">PostUp</h1>
          <Input
            value={arteTitle}
            onChange={(e) => setArteTitle(e.target.value)}
            className="w-64 h-9 bg-white/20 text-white placeholder:text-white/70 border-white/30"
            placeholder="Nome da arte"
          />
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={resetZoom} variant="ghost" size="sm" className="text-white hover:bg-white/20">
            {Math.round(zoom * 100)}%
          </Button>
          <Button onClick={handleZoomOut} variant="ghost" size="icon" className="text-white hover:bg-white/20">
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button onClick={handleZoomIn} variant="ghost" size="icon" className="text-white hover:bg-white/20">
            <ZoomIn className="w-4 h-4" />
          </Button>
          <div className="w-px h-6 bg-white/30 mx-2" />
          <Button onClick={handleZoomIn} variant="ghost" size="icon" className="text-white hover:bg-white/20">
            <Undo className="w-4 h-4" />
          </Button>
          <Button onClick={handleZoomOut} variant="ghost" size="icon" className="text-white hover:bg-white/20">
            <Redo className="w-4 h-4" />
          </Button>
          <div className="w-px h-6 bg-white/30 mx-2" />
          <Button onClick={downloadArte} variant="ghost" className="text-white hover:bg-white/20 gap-2">
            <Download className="w-4 h-4" />
            Exportar
          </Button>
          <Button
            onClick={saveArte}
            disabled={saving}
            className="bg-white text-purple-600 hover:bg-gray-100 font-semibold gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? "Salvando..." : "Salvar"}
          </Button>
          <Button
            onClick={() => router.push("/dashboard")}
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20 ml-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Canva Style Navigation */}
        <div className="w-20 bg-gray-50 border-r border-gray-200 flex flex-col items-center py-4 gap-1 flex-shrink-0">
          <button
            onClick={() => setActiveSidebar(activeSidebar === 'templates' ? null : 'templates')}
            className={`w-16 h-16 flex flex-col items-center justify-center gap-1 rounded-lg transition-colors ${
              activeSidebar === 'templates' ? 'bg-purple-100 text-purple-600' : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <Layers className="w-6 h-6" />
            <span className="text-[10px] font-medium">Modelos</span>
          </button>
          
          <button
            onClick={() => setActiveSidebar(activeSidebar === 'elements' ? null : 'elements')}
            className={`w-16 h-16 flex flex-col items-center justify-center gap-1 rounded-lg transition-colors ${
              activeSidebar === 'elements' ? 'bg-purple-100 text-purple-600' : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <Square className="w-6 h-6" />
            <span className="text-[10px] font-medium">Elementos</span>
          </button>
          
          <button
            onClick={() => setActiveSidebar(activeSidebar === 'images' ? null : 'images')}
            className={`w-16 h-16 flex flex-col items-center justify-center gap-1 rounded-lg transition-colors ${
              activeSidebar === 'images' ? 'bg-purple-100 text-purple-600' : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <ImageIcon className="w-6 h-6" />
            <span className="text-[10px] font-medium">Imagens</span>
          </button>
          
          <button
            onClick={() => setActiveSidebar(activeSidebar === 'text' ? null : 'text')}
            className={`w-16 h-16 flex flex-col items-center justify-center gap-1 rounded-lg transition-colors ${
              activeSidebar === 'text' ? 'bg-purple-100 text-purple-600' : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <Type className="w-6 h-6" />
            <span className="text-[10px] font-medium">Texto</span>
          </button>
          
          <button
            onClick={() => setActiveSidebar(activeSidebar === 'background' ? null : 'background')}
            className={`w-16 h-16 flex flex-col items-center justify-center gap-1 rounded-lg transition-colors ${
              activeSidebar === 'background' ? 'bg-purple-100 text-purple-600' : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <Circle className="w-6 h-6" />
            <span className="text-[10px] font-medium">Fundo</span>
          </button>
        </div>

        {/* Content Panel - Shows based on active sidebar */}
        {activeSidebar && (
          <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto shrink-0">
            {/* Templates Panel */}
            {activeSidebar === 'templates' && (
              <div className="p-4">
                <h3 className="text-lg font-bold mb-2">Modelos Prontos</h3>
                <p className="text-sm text-gray-600 mb-4">Clique para editar textos e personalizar</p>
                
                {/* Templates do Banco de Dados */}
                {loadingTemplates ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="text-xs text-gray-500 mt-2">Carregando templates...</p>
                  </div>
                ) : dbTemplates.length > 0 ? (
                  <>
                    {/* Group templates by category */}
                    {['aniversario', 'promocao', 'vaga', 'dica', 'motivacional', 'basico'].map((cat) => {
                      const categoryTemplates = dbTemplates.filter(t => t.category === cat);
                      if (categoryTemplates.length === 0) return null;
                      
                      const categoryLabels: Record<string, string> = {
                        aniversario: '🎉 Aniversário',
                        promocao: '🔥 Promoções',
                        vaga: '💼 Vagas',
                        dica: '💡 Dicas',
                        motivacional: '✨ Motivacional',
                        basico: '📐 Básico',
                      };
                      
                      return (
                        <div key={cat} className="mb-6">
                          <h4 className="text-sm font-semibold text-purple-700 mb-3">
                            {categoryLabels[cat]}
                          </h4>
                          <div className="grid grid-cols-2 gap-3">
                            {categoryTemplates.map((template) => (
                              <button
                                key={template.id}
                                onClick={() => applyDbTemplate(template)}
                                className="relative aspect-square rounded-lg overflow-hidden hover:ring-2 hover:ring-purple-500 transition-all group"
                                title={template.description || template.title}
                              >
                                {template.thumbnail_url ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={template.thumbnail_url}
                                    alt={template.title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-blue-500 p-2 flex items-center justify-center">
                                    <div className="text-white text-[10px] font-bold text-center">
                                      {template.title}
                                    </div>
                                  </div>
                                )}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[9px] px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  {template.title}
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                    
                    <div className="border-t border-gray-200 pt-6 mb-6">
                      <h4 className="text-sm font-semibold text-gray-500 mb-3">Templates Antigos (para remover)</h4>
                    </div>
                  </>
                ) : null}
                
                {/* Aniversário e Celebrações */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-purple-700 mb-3">🎉 Aniversário e Celebrações</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => applyPrebuiltTemplate('birthday-party')}
                      className="relative aspect-square rounded-lg overflow-hidden hover:ring-2 hover:ring-purple-500 transition-all group"
                    >
                      <div className="absolute inset-0 bg-yellow-100 p-2 flex flex-col items-center justify-center">
                        <div className="text-red-600 text-[14px] font-bold">FELIZ</div>
                        <div className="text-red-600 text-[14px] font-bold">ANIVERSÁRIO</div>
                        <div className="mt-1 text-yellow-700 text-[7px]">Festa</div>
                      </div>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    </button>

                    <button
                      onClick={() => applyPrebuiltTemplate('company-anniversary')}
                      className="relative aspect-square rounded-lg overflow-hidden hover:ring-2 hover:ring-purple-500 transition-all group"
                    >
                      <div className="absolute inset-0 bg-blue-900 p-2 flex flex-col items-center justify-center">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-1">
                          <div className="text-blue-900 text-[18px] font-bold">5</div>
                        </div>
                        <div className="text-white text-[9px] font-bold">ANOS</div>
                      </div>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    </button>
                  </div>
                </div>

                {/* Promoções e Vendas */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-purple-700 mb-3">🔥 Promoções e Vendas</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => applyPrebuiltTemplate('black-friday')}
                      className="relative aspect-square rounded-lg overflow-hidden hover:ring-2 hover:ring-purple-500 transition-all group"
                    >
                      <div className="absolute inset-0 bg-black p-2 flex flex-col items-center justify-center">
                        <div className="text-white text-[12px] font-bold">BLACK</div>
                        <div className="text-white text-[12px] font-bold">FRIDAY</div>
                        <div className="mt-1 text-yellow-300 text-[9px] font-bold">70% OFF</div>
                      </div>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    </button>

                    <button
                      onClick={() => applyPrebuiltTemplate('discount-promo')}
                      className="relative aspect-square rounded-lg overflow-hidden hover:ring-2 hover:ring-purple-500 transition-all group"
                    >
                      <div className="absolute inset-0 bg-red-500 p-2 flex flex-col items-center justify-center">
                        <div className="w-14 h-14 bg-yellow-200 rounded-full flex items-center justify-center">
                          <div className="text-red-600 text-[16px] font-bold">50%</div>
                        </div>
                        <div className="mt-1 text-white text-[8px] font-bold">PROMOÇÃO</div>
                      </div>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    </button>

                    <button
                      onClick={() => applyPrebuiltTemplate('clearance-sale')}
                      className="relative aspect-square rounded-lg overflow-hidden hover:ring-2 hover:ring-purple-500 transition-all group"
                    >
                      <div className="absolute inset-0 bg-orange-600 p-2 flex flex-col items-center justify-center">
                        <div className="text-white text-[11px] font-bold text-center leading-tight">
                          QUEIMA DE<br/>ESTOQUE
                        </div>
                        <div className="mt-1 text-yellow-300 text-[9px] font-bold">80% OFF</div>
                      </div>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    </button>
                  </div>
                </div>

                {/* Vagas de Emprego */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-purple-700 mb-3">💼 Vagas de Emprego</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => applyPrebuiltTemplate('hiring-modern')}
                      className="relative aspect-square rounded-lg overflow-hidden hover:ring-2 hover:ring-purple-500 transition-all group"
                    >
                      <div className="absolute inset-0 bg-slate-900 p-2 flex flex-col justify-center">
                        <div className="w-1 h-full bg-cyan-400 absolute left-0 top-0"></div>
                        <div className="text-white text-[10px] font-bold leading-tight ml-2">
                          ESTAMOS<br/>CONTRATANDO
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    </button>

                    <button
                      onClick={() => applyPrebuiltTemplate('job-benefits')}
                      className="relative aspect-square rounded-lg overflow-hidden hover:ring-2 hover:ring-purple-500 transition-all group"
                    >
                      <div className="absolute inset-0 bg-indigo-600 p-2 flex flex-col items-center justify-center">
                        <div className="text-white text-[10px] font-bold text-center leading-tight">
                          FAÇA PARTE<br/>DO TIME
                        </div>
                        <div className="mt-1 text-indigo-200 text-[7px]">💰 🏠 📚</div>
                      </div>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    </button>
                  </div>
                </div>

                {/* Dicas e Educacional */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-purple-700 mb-3">💡 Dicas e Educacional</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => applyPrebuiltTemplate('tip-of-day')}
                      className="relative aspect-square rounded-lg overflow-hidden hover:ring-2 hover:ring-purple-500 transition-all group"
                    >
                      <div className="absolute inset-0 bg-green-50 p-2 flex flex-col justify-center">
                        <div className="bg-green-500 text-white text-[8px] font-bold px-2 py-0.5 rounded-full w-fit">DICA</div>
                        <div className="mt-2 text-green-800 text-[9px] font-bold leading-tight">
                          Como aumentar<br/>suas vendas
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    </button>

                    <button
                      onClick={() => applyPrebuiltTemplate('step-tutorial')}
                      className="relative aspect-square rounded-lg overflow-hidden hover:ring-2 hover:ring-purple-500 transition-all group"
                    >
                      <div className="absolute inset-0 bg-white p-2 flex flex-col">
                        <div className="bg-purple-600 text-white text-[9px] font-bold px-2 py-1 rounded mb-2">
                          PASSO A PASSO
                        </div>
                        <div className="flex items-center gap-1 mb-1">
                          <div className="w-4 h-4 bg-purple-300 rounded-full flex items-center justify-center text-white text-[8px] font-bold">1</div>
                          <div className="text-gray-700 text-[7px]">Passo 1</div>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-4 h-4 bg-purple-300 rounded-full flex items-center justify-center text-white text-[8px] font-bold">2</div>
                          <div className="text-gray-700 text-[7px]">Passo 2</div>
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    </button>
                  </div>
                </div>

                {/* Frases Motivacionais */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-purple-700 mb-3">✨ Frases Motivacionais</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => applyPrebuiltTemplate('motivational-quote')}
                      className="relative aspect-square rounded-lg overflow-hidden hover:ring-2 hover:ring-purple-500 transition-all group"
                    >
                      <div className="absolute inset-0 bg-gray-800 p-2 flex flex-col items-center justify-center">
                        <div className="text-white text-[9px] italic text-center leading-tight">
                          "O sucesso é<br/>a soma de<br/>pequenos<br/>esforços"
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    </button>
                  </div>
                </div>

                {/* Templates Básicos (originais) */}
                <div className="mb-6 pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-semibold text-purple-700 mb-3">📐 Templates Básicos</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Negócios Moderno */}
                    <button
                      onClick={() => applyPrebuiltTemplate('business-blue')}
                      className="relative aspect-square rounded-lg overflow-hidden hover:ring-2 hover:ring-purple-500 transition-all group"
                    >
                      <div className="absolute inset-0 bg-slate-900 p-2 flex flex-col justify-center">
                        <div className="text-white text-[11px] font-bold leading-tight">
                          FAÇA SEU<br/>NEGÓCIO<br/>CRESCER
                        </div>
                        <div className="mt-2 w-12 h-0.5 bg-blue-500"></div>
                      </div>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    </button>

                    {/* Marketing Digital */}
                    <button
                      onClick={() => applyPrebuiltTemplate('marketing-purple')}
                      className="relative aspect-square rounded-lg overflow-hidden hover:ring-2 hover:ring-purple-500 transition-all group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-700 to-purple-600 p-2 flex flex-col justify-center">
                        <div className="text-white text-[11px] font-bold leading-tight">
                          MARKETING<br/>DIGITAL
                        </div>
                        <div className="mt-2 bg-white rounded-full px-2 py-0.5 inline-block w-fit">
                          <div className="text-purple-700 text-[7px] font-bold">COMEÇAR</div>
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    </button>

                    {/* Redes Sociais */}
                    <button
                      onClick={() => applyPrebuiltTemplate('social-red')}
                      className="relative aspect-square rounded-lg overflow-hidden hover:ring-2 hover:ring-purple-500 transition-all group"
                    >
                      <div className="absolute inset-0 bg-rose-500 p-2 flex flex-col justify-center items-center">
                        <div className="bg-white px-2 py-1 rounded">
                          <div className="text-rose-500 text-[10px] font-bold">50K+</div>
                          <div className="text-rose-900 text-[6px] font-bold">SEGUIDORES</div>
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    </button>

                    {/* Gastronomia */}
                    <button
                      onClick={() => applyPrebuiltTemplate('food-green')}
                      className="relative aspect-square rounded-lg overflow-hidden hover:ring-2 hover:ring-purple-500 transition-all group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-green-700 to-green-600 p-2 flex flex-col justify-center">
                        <div className="text-white text-[11px] font-bold leading-tight">
                          RECEITA<br/>DELICIOSA
                        </div>
                        <div className="mt-2 text-green-200 text-[7px]">Simples e rápida</div>
                      </div>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    </button>

                    {/* Abstrato Moderno */}
                    <button
                      onClick={() => applyPrebuiltTemplate('abstract-bg')}
                      className="relative aspect-square rounded-lg overflow-hidden hover:ring-2 hover:ring-purple-500 transition-all group"
                    >
                      <div className="absolute inset-0 bg-indigo-950 flex items-center justify-center">
                        <div className="absolute w-10 h-10 bg-rose-500 opacity-50 rounded-full -left-2 -top-2"></div>
                        <div className="absolute w-8 h-8 bg-purple-500 opacity-50 rounded-full right-2 top-4"></div>
                        <div className="absolute w-9 h-9 bg-blue-500 opacity-50 rounded-full left-3 bottom-1"></div>
                        <div className="text-white text-[8px] font-bold z-10">ABSTRATO</div>
                      </div>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    </button>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-semibold mb-3">Tamanhos Rápidos</h4>
                  <div className="space-y-2">
                    <Button
                      onClick={() => applyTemplate('post')}
                      variant="outline"
                      className="w-full justify-start text-sm h-10"
                    >
                      📱 Post Instagram (1080x1080)
                    </Button>
                    <Button
                      onClick={() => applyTemplate('story')}
                      variant="outline"
                      className="w-full justify-start text-sm h-10"
                    >
                      📲 Story (1080x1920)
                    </Button>
                    <Button
                      onClick={() => applyTemplate('square')}
                      variant="outline"
                      className="w-full justify-start text-sm h-10"
                    >
                      🖼️ Banner (1200x1200)
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Elements Panel */}
            {activeSidebar === 'elements' && (
              <div className="p-4">
                <h3 className="text-lg font-bold mb-4">Elementos</h3>
                <div className="space-y-2">
                  <Button
                    onClick={addRectangle}
                    variant="outline"
                    className="w-full justify-start h-12"
                  >
                    <Square className="w-5 h-5 mr-3" />
                    Retângulo
                  </Button>
                  <Button
                    onClick={addCircle}
                    variant="outline"
                    className="w-full justify-start h-12"
                  >
                    <Circle className="w-5 h-5 mr-3" />
                    Círculo
                  </Button>
                </div>
              </div>
            )}

            {/* Images Panel */}
            {activeSidebar === 'images' && (
              <div className="p-4">
                <h3 className="text-lg font-bold mb-4">Imagens</h3>
                
                {/* Upload Area */}
                <div className="mb-6">
                  <div
                    onClick={addImageFromFile}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-all"
                  >
                    <ImageIcon className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      Clique para fazer upload
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF até 10MB
                    </p>
                  </div>
                </div>

                {/* User Images Gallery */}
                {userImages.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold mb-3">Minhas Imagens</h4>
                    <div className="grid grid-cols-2 gap-2 max-h-[400px] overflow-y-auto">
                      {userImages.map((image) => (
                        <div
                          key={image.id}
                          onClick={() => addImageFromGallery(image.url)}
                          className="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-purple-500 transition-all"
                        >
                          <img
                            src={image.thumbnail_url || image.url}
                            alt={image.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {loadingImages && (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="text-xs text-gray-500 mt-2">Carregando imagens...</p>
                  </div>
                )}

                {/* Free Stock Photos Section */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-semibold mb-3">Fotos Gratuitas (Unsplash)</h4>
                  <p className="text-xs text-gray-500 mb-3">
                    Clique em qualquer foto para adicionar ao canvas
                  </p>
                  
                  {loadingStockPhotos ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                      <p className="text-xs text-gray-500 mt-2">Carregando fotos...</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 max-h-[500px] overflow-y-auto">
                      {stockPhotos.map((photo) => (
                        <div
                          key={photo.id}
                          onClick={() => addImageFromGallery(photo.url)}
                          className="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-purple-500 transition-all relative group"
                        >
                          <img
                            src={photo.thumb}
                            alt={`Foto de ${photo.author}`}
                            loading="lazy"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                            <div className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity text-center px-2">
                              <ImageIcon className="w-6 h-6 mx-auto mb-1" />
                              Clique para adicionar
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Text Panel */}
            {activeSidebar === 'text' && (
              <div className="p-4">
                <h3 className="text-lg font-bold mb-4">Texto</h3>
                <Button
                  onClick={addText}
                  variant="outline"
                  className="w-full justify-start h-12"
                >
                  <Type className="w-5 h-5 mr-3" />
                  Adicionar Texto
                </Button>
              </div>
            )}

            {/* Background Panel */}
            {activeSidebar === 'background' && (
              <div className="p-4">
                <h3 className="text-lg font-bold mb-4">Fundo</h3>
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Cor de Fundo</Label>
                    <input
                      type="color"
                      value={canvas?.backgroundColor as string || '#ffffff'}
                      onChange={(e) => {
                        if (canvas) {
                          canvas.backgroundColor = e.target.value;
                          canvas.renderAll();
                        }
                      }}
                      className="w-full h-12 rounded border border-gray-300 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Canvas Area */}
        <div
          ref={canvasContainerRef}
          className="flex-1 bg-gray-100 overflow-hidden flex items-center justify-center"
        >
          <canvas ref={canvasRef} />
        </div>

        {/* Right Sidebar - Properties (Always visible) */}
        <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto flex-shrink-0">
          {/* Layers Panel */}
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-sm font-semibold mb-3">🎨 Camadas</h3>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {layers.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-4">Nenhuma camada</p>
              ) : (
                [...layers].reverse().map((obj, index) => {
                  const isSelected = selectedLayer === obj;
                  const realIndex = layers.length - 1 - index;
                  return (
                    <div
                      key={realIndex}
                      className={`flex items-center gap-2 p-2 rounded border transition-colors ${
                        isSelected ? 'bg-purple-50 border-purple-400' : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <button
                        onClick={() => toggleLayerVisibility(obj)}
                        className="flex-shrink-0 w-5 h-5 flex items-center justify-center hover:bg-gray-100 rounded text-xs"
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
          </div>
          
          {/* Properties Panel */}
          {selectedLayer && (
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-sm font-semibold mb-3">⚙️ Propriedades</h3>
              <div className="space-y-2">
                {/* Position */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">X</Label>
                    <Input
                      type="number"
                      value={editingProps.left || 0}
                      onChange={(e) => applyPropertyChange('left', e.target.value)}
                      className="h-7 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Y</Label>
                    <Input
                      type="number"
                      value={editingProps.top || 0}
                      onChange={(e) => applyPropertyChange('top', e.target.value)}
                      className="h-7 text-xs"
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
                      className="h-7 text-xs"
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
                      className="h-7 text-xs"
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
                          className="h-7 text-xs"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Cor</Label>
                        <input
                          type="color"
                          value={editingProps.fill || '#000000'}
                          onChange={(e) => applyPropertyChange('fill', e.target.value)}
                          className="w-full h-7 rounded border cursor-pointer"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Espaçamento entre Letras</Label>
                      <Input
                        type="number"
                        value={editingProps.charSpacing || 0}
                        onChange={(e) => applyPropertyChange('charSpacing', e.target.value)}
                        className="h-7 text-xs"
                        step="10"
                      />
                    </div>
                  </>
                )}
                
                {/* Shape Properties */}
                {(selectedLayer.type === 'rect' || selectedLayer.type === 'circle') && (
                  <>
                    <div>
                      <Label className="text-xs">Cor de Preenchimento</Label>
                      <input
                        type="color"
                        value={editingProps.fill || '#000000'}
                        onChange={(e) => applyPropertyChange('fill', e.target.value)}
                        className="w-full h-8 rounded border cursor-pointer"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Cor da Borda</Label>
                        <input
                          type="color"
                          value={editingProps.stroke || '#000000'}
                          onChange={(e) => applyPropertyChange('stroke', e.target.value)}
                          className="w-full h-7 rounded border cursor-pointer"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Largura Borda</Label>
                        <Input
                          type="number"
                          value={editingProps.strokeWidth || 0}
                          onChange={(e) => applyPropertyChange('strokeWidth', e.target.value)}
                          className="h-7 text-xs"
                          min="0"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
          
          {/* Custom Resolution Panel */}
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-sm font-semibold mb-3">📐 Resolução Personalizada</h3>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Largura (px)</Label>
                  <Input
                    type="number"
                    min="100"
                    max="5000"
                    value={customWidth}
                    onChange={(e) => setCustomWidth(e.target.value)}
                    className="h-8 text-xs"
                    placeholder="800"
                  />
                </div>
                <div>
                  <Label className="text-xs">Altura (px)</Label>
                  <Input
                    type="number"
                    min="100"
                    max="5000"
                    value={customHeight}
                    onChange={(e) => setCustomHeight(e.target.value)}
                    className="h-8 text-xs"
                    placeholder="600"
                  />
                </div>
              </div>
              <Button
                onClick={applyCustomSize}
                size="sm"
                variant="outline"
                className="w-full h-8 text-xs"
              >
                Aplicar Tamanho
              </Button>
              <Button
                onClick={() => {
                  if (!fabricCanvas) return;
                  const activeObj = fabricCanvas.getActiveObject();
                  if (activeObj && activeObj.type === 'image') {
                    adjustCanvasToImage(activeObj as fabric.FabricImage);
                  } else {
                    toast.error('Selecione uma imagem primeiro');
                  }
                }}
                size="sm"
                variant="outline"
                className="w-full h-8 text-xs"
              >
                Ajustar ao Tamanho da Imagem
              </Button>
            </div>
          </div>
          
          {/* Pages Manager - Always visible at top */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">Páginas</h3>
              <Button
                onClick={addNewPage}
                size="sm"
                className="h-8 bg-purple-600 hover:bg-purple-700"
              >
                + Nova
              </Button>
            </div>
            
            {/* Pages Grid */}
            <div className="grid grid-cols-3 gap-2">
              {pages.map((page, index) => (
                <div
                  key={page.id}
                  className={`relative group cursor-pointer rounded-lg border-2 transition-all ${
                    currentPageIndex === index 
                      ? 'border-purple-500 shadow-md' 
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                  onClick={() => loadPage(index)}
                >
                  {/* Page Thumbnail */}
                  <div className="aspect-square bg-gray-50 rounded-t-md overflow-hidden">
                    {page.thumbnail ? (
                      <img 
                        src={page.thumbnail} 
                        alt={`Página ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                        Vazio
                      </div>
                    )}
                  </div>
                  
                  {/* Page Number */}
                  <div className="p-1 text-center text-xs font-medium bg-white">
                    {index + 1}
                  </div>
                  
                  {/* Actions on hover */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-1">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        duplicatePage(index);
                      }}
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-white hover:bg-white/20"
                      title="Duplicar"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                    {pages.length > 1 && (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          deletePage(index);
                        }}
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-white hover:bg-red-500/30"
                        title="Deletar"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Object Properties */}
          {selectedObject ? (
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold">Propriedades</h3>
                <div className="flex gap-1">
                  <Button
                    onClick={duplicateSelected}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    title="Duplicar"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={bringToFront}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    title="Trazer para frente"
                  >
                    <Move className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={deleteSelected}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                    title="Deletar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <Tabs defaultValue="style" className="w-full">
                <TabsList className="w-full">
                  <TabsTrigger value="style" className="flex-1">Estilo</TabsTrigger>
                  <TabsTrigger value="position" className="flex-1">Posição</TabsTrigger>
                </TabsList>

                <TabsContent value="style" className="space-y-4 mt-4">
                  {/* Text Properties */}
                  {selectedObject.type === "i-text" && (
                    <>
                      <div>
                        <Label className="text-xs font-semibold mb-2 block">Fonte</Label>
                        <Input
                          list="font-options"
                          value={fontSearchInput}
                          onChange={(e) => {
                            setFontSearchInput(e.target.value);
                            updateFontFamily(e.target.value);
                          }}
                          placeholder="Digite ou selecione uma fonte..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          style={{ fontFamily: fontFamily }}
                        />
                        <datalist id="font-options">
                          <option value="Arial" />
                          <option value="Helvetica" />
                          <option value="Times New Roman" />
                          <option value="Courier New" />
                          <option value="Georgia" />
                          <option value="Verdana" />
                          <option value="Impact" />
                          <option value="Roboto" />
                          <option value="Open Sans" />
                          <option value="Lato" />
                          <option value="Montserrat" />
                          <option value="Poppins" />
                          <option value="Raleway" />
                          <option value="Ubuntu" />
                          <option value="Noto Sans" />
                          <option value="Rubik" />
                          <option value="Nunito" />
                          <option value="Quicksand" />
                          <option value="Source Sans 3" />
                          <option value="Comfortaa" />
                          <option value="PT Sans" />
                          <option value="Josefin Sans" />
                          <option value="Barlow" />
                          <option value="DM Sans" />
                          <option value="Signika" />
                          <option value="Merriweather" />
                          <option value="Playfair Display" />
                          <option value="Bitter" />
                          <option value="Cinzel" />
                          <option value="Bebas Neue" />
                          <option value="Oswald" />
                          <option value="Anton" />
                          <option value="Righteous" />
                          <option value="Archivo Black" />
                          <option value="Alfa Slab One" />
                          <option value="Bungee" />
                          <option value="Russo One" />
                          <option value="Teko" />
                          <option value="Concert One" />
                          <option value="Yanone Kaffeesatz" />
                          <option value="Fredoka" />
                          <option value="Dancing Script" />
                          <option value="Pacifico" />
                          <option value="Great Vibes" />
                          <option value="Satisfy" />
                          <option value="Caveat" />
                          <option value="Shadows Into Light" />
                          <option value="Indie Flower" />
                          <option value="Amatic SC" />
                          <option value="Lobster" />
                          <option value="Permanent Marker" />
                          <option value="Bangers" />
                          <option value="Press Start 2P" />
                          <option value="Orbitron" />
                        </datalist>
                      </div>

                      <div>
                        <Label className="text-xs font-semibold mb-2 block">
                          Tamanho: {fontSize}px
                        </Label>
                        <Slider
                          value={[fontSize]}
                          onValueChange={([value]: number[]) => updateFontSize(value)}
                          min={8}
                          max={200}
                          step={1}
                          className="w-full"
                        />
                      </div>

                      <div>
                        <Label className="text-xs font-semibold mb-2 block">Cor do Texto</Label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={textColor}
                            onChange={(e) => updateTextColor(e.target.value)}
                            className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                          />
                          <Input
                            value={textColor}
                            onChange={(e) => updateTextColor(e.target.value)}
                            className="flex-1 h-10 text-xs font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs font-semibold mb-2 block">Formatação</Label>
                        <div className="flex gap-2">
                          <Button
                            onClick={toggleBold}
                            variant={fontWeight === "bold" ? "default" : "outline"}
                            size="icon"
                            className="h-10 w-10"
                          >
                            <Bold className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={toggleItalic}
                            variant={fontStyle === "italic" ? "default" : "outline"}
                            size="icon"
                            className="h-10 w-10"
                          >
                            <Italic className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={toggleUnderline}
                            variant={textDecoration === "underline" ? "default" : "outline"}
                            size="icon"
                            className="h-10 w-10"
                          >
                            <Underline className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs font-semibold mb-2 block">Alinhamento</Label>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => updateTextAlign("left")}
                            variant={textAlign === "left" ? "default" : "outline"}
                            size="icon"
                            className="h-10 flex-1"
                          >
                            <AlignLeft className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => updateTextAlign("center")}
                            variant={textAlign === "center" ? "default" : "outline"}
                            size="icon"
                            className="h-10 flex-1"
                          >
                            <AlignCenter className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => updateTextAlign("right")}
                            variant={textAlign === "right" ? "default" : "outline"}
                            size="icon"
                            className="h-10 flex-1"
                          >
                            <AlignRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Shape Properties */}
                  {selectedObject.type !== "i-text" && selectedObject.type !== "image" && (
                    <>
                      <div>
                        <Label className="text-xs font-semibold mb-2 block">Cor de Preenchimento</Label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={fillColor}
                            onChange={(e) => updateFillColor(e.target.value)}
                            className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                          />
                          <Input
                            value={fillColor}
                            onChange={(e) => updateFillColor(e.target.value)}
                            className="flex-1 h-10 text-xs font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs font-semibold mb-2 block">Cor da Borda</Label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={strokeColor}
                            onChange={(e) => updateStrokeColor(e.target.value)}
                            className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                          />
                          <Input
                            value={strokeColor}
                            onChange={(e) => updateStrokeColor(e.target.value)}
                            className="flex-1 h-10 text-xs font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs font-semibold mb-2 block">
                          Largura da Borda: {strokeWidth}px
                        </Label>
                        <Slider
                          value={[strokeWidth]}
                          onValueChange={([value]: number[]) => updateStrokeWidth(value)}
                          min={0}
                          max={50}
                          step={1}
                          className="w-full"
                        />
                      </div>
                    </>
                  )}

                  {/* Common Properties */}
                  <div>
                    <Label className="text-xs font-semibold mb-2 block">
                      Opacidade: {opacity}%
                    </Label>
                    <Slider
                      value={[opacity]}
                      onValueChange={([value]: number[]) => updateOpacity(value)}
                      min={0}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="position" className="space-y-4 mt-4">
                  <div>
                    <Label className="text-xs font-semibold mb-2 block">Posição X</Label>
                    <Input
                      type="number"
                      value={Math.round(selectedObject.left || 0)}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 0;
                        selectedObject.set("left", value);
                        canvas?.renderAll();
                      }}
                      className="h-10"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold mb-2 block">Posição Y</Label>
                    <Input
                      type="number"
                      value={Math.round(selectedObject.top || 0)}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 0;
                        selectedObject.set("top", value);
                        canvas?.renderAll();
                      }}
                      className="h-10"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold mb-2 block">Largura</Label>
                    <Input
                      type="number"
                      value={Math.round((selectedObject.width || 0) * (selectedObject.scaleX || 1))}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 0;
                        const scaleX = value / (selectedObject.width || 1);
                        selectedObject.set("scaleX", scaleX);
                        canvas?.renderAll();
                      }}
                      className="h-10"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold mb-2 block">Altura</Label>
                    <Input
                      type="number"
                      value={Math.round((selectedObject.height || 0) * (selectedObject.scaleY || 1))}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 0;
                        const scaleY = value / (selectedObject.height || 1);
                        selectedObject.set("scaleY", scaleY);
                        canvas?.renderAll();
                      }}
                      className="h-10"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold mb-2 block">Rotação: {Math.round(selectedObject.angle || 0)}°</Label>
                    <Slider
                      value={[selectedObject.angle || 0]}
                      onValueChange={([value]: number[]) => {
                        selectedObject.set("angle", value);
                        canvas?.renderAll();
                      }}
                      min={0}
                      max={360}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8 text-center">
              <Square className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-sm font-medium mb-2">Nenhum elemento selecionado</p>
              <p className="text-xs">Clique em um elemento no canvas para editar</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
