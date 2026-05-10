import * as React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// 替代 @/lib/utils 裡的 cn
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 簡單的 X 圖標替代 lucide-react
const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);

const DialogCompositionContext = React.createContext({
  isComposing: () => false,
});

function Dialog({ children, open, onOpenChange }: any) {
  if (!open) return null;
  return (
    <DialogCompositionContext.Provider value={{ isComposing: () => false }}>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        {children}
      </div>
    </DialogCompositionContext.Provider>
  );
}

function DialogContent({ className, children, ...props }: any) {
  return (
    <div
      className={cn(
        "bg-white dark:bg-slate-900 fixed z-50 grid w-full max-w-lg translate-y-[-5%] gap-4 rounded-lg border p-6 shadow-lg duration-200",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function DialogHeader({ className, ...props }: any) {
  return <div className={cn("flex flex-col gap-2 text-center sm:text-left", className)} {...props} />;
}

function DialogFooter({ className, ...props }: any) {
  return <div className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)} {...props} />;
}

function DialogTitle({ className, ...props }: any) {
  return <h2 className={cn("text-lg leading-none font-semibold", className)} {...props} />;
}

function DialogDescription({ className, ...props }: any) {
  return <p className={cn("text-muted-foreground text-sm", className)} {...props} />;
}

// 為了讓 UpdatePrompt 不報錯，補齊其他組件
const DialogTrigger = (props: any) => <div {...props} />;
const DialogPortal = ({ children }: any) => <>{children}</>;
const DialogOverlay = (props: any) => <div {...props} />;
const DialogClose = (props: any) => <button {...props} />;

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger
};
