import React, { useState } from 'react';
import { AIFriend } from '../types/AIFriend';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from './ui/dialog';
import { useToast } from '../hooks/use-toast';
import { useUpdateAIFriend } from '../integrations/supabase/hooks/useAIFriend';
import { User, Save } from 'lucide-react';

interface AIFriendEditorProps {
  friend: AIFriend;
  onAIFriendUpdated: () => void;
  children: React.ReactNode;
  userId: string;
}

const AIFriendEditor: React.FC<AIFriendEditorProps> = ({
  friend,
  onAIFriendUpdated,
  children,
  userId,
}) => {
  const [editedFriend, setEditedFriend] = useState(friend);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const updateAIFriend = useUpdateAIFriend();

  const handleSave = async () => {
    try {
      await updateAIFriend.mutateAsync({
        updatedAIFriend: editedFriend,
        userId: userId,
      });
      toast({
        title: 'AI Friend Updated',
        description: `${friend.name}'s profile has been updated!`,
        className: 'bg-comic-green text-black font-bold',
      });
      onAIFriendUpdated();
      setIsOpen(false);
      localStorage.removeItem('aiFriendsSummary');
      localStorage.removeItem('cachedAIFriendsData');
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update AI Friend. Please try again.',
        variant: 'destructive',
        className: 'bg-comic-red text-white font-bold',
      });
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value.slice(0, 12);
    setEditedFriend({ ...editedFriend, name: newName });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="p-0">
          {children}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px] max-h-[90vh] overflow-y-auto bg-gradient-to-br from-blue-50 to-white backdrop-blur-lg border border-blue-200 rounded-2xl shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
            Edit AI Friend
          </DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
          className="space-y-4"
        >
          <div>
            <label htmlFor="name" className="text-lg font-medium text-blue-800">
              Name (max 12 characters)
            </label>
            <div className="relative mt-2">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400" />
              <Input
                id="name"
                value={editedFriend.name}
                onChange={handleNameChange}
                maxLength={12}
                className="w-full pl-10 pr-3 py-3 text-xl bg-white border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent placeholder-blue-300 text-blue-800"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="persona"
              className="text-lg font-medium text-blue-800"
            >
              Persona
            </label>
            <Textarea
              id="persona"
              value={editedFriend.persona}
              onChange={(e) =>
                setEditedFriend({ ...editedFriend, persona: e.target.value })
              }
              className="mt-2 text-base p-3 bg-white border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent text-blue-800"
              rows={3}
            />
          </div>
          <div>
            <label
              htmlFor="about"
              className="text-lg font-medium text-blue-800"
            >
              About (comma-separated)
            </label>
            <Textarea
              id="about"
              value={editedFriend.about}
              onChange={(e) =>
                setEditedFriend({ ...editedFriend, about: e.target.value })
              }
              className="mt-2 text-base p-3 bg-white border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent text-blue-800"
              rows={3}
            />
          </div>
          <div>
            <label
              htmlFor="knowledgeBase"
              className="text-lg font-medium text-blue-800"
            >
              Knowledge Base
            </label>
            <Textarea
              id="knowledgeBase"
              value={editedFriend.knowledge_base}
              onChange={(e) =>
                setEditedFriend({
                  ...editedFriend,
                  knowledge_base: e.target.value,
                })
              }
              className="mt-2 text-base p-3 bg-white border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent text-blue-800"
              rows={3}
            />
          </div>
          <DialogFooter className="flex flex-row justify-between gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="w-1/2 bg-gradient-to-r from-blue-100 to-blue-200 hover:from-blue-200 hover:to-blue-300 text-blue-800 rounded-xl transform hover:scale-105 transition-all duration-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="w-1/2 bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white rounded-xl transform hover:scale-105 transition-all duration-300"
            >
              <Save className="mr-2 h-5 w-5" /> Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AIFriendEditor;
