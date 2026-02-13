import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Shield, Crown, User } from "lucide-react";
import type { User as UserType, OrganizationMember } from "@shared/schema";

interface TeamMember extends OrganizationMember {
  user: UserType;
}

const roleConfig = (role: string) => {
  switch (role) {
    case "owner":
      return { icon: Crown, color: "text-amber-500", bg: "bg-amber-500/10", variant: "default" as const };
    case "admin":
      return { icon: Shield, color: "text-blue-500", bg: "bg-blue-500/10", variant: "secondary" as const };
    default:
      return { icon: User, color: "text-muted-foreground", bg: "bg-muted", variant: "outline" as const };
  }
};

export default function Team() {
  const { toast } = useToast();

  const { data: members, isLoading } = useQuery<TeamMember[]>({
    queryKey: ["/api/admin/users"],
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: string }) =>
      apiRequest("PUT", `/api/admin/users/${memberId}/role`, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Role updated" });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update role",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-4xl mx-auto page-enter">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Team
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your team members and roles.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-5">
              <div className="flex items-center gap-3">
                <Skeleton className="h-11 w-11 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <Skeleton className="h-9 w-24" />
              </div>
            </Card>
          ))}
        </div>
      ) : !members || members.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Users className="h-7 w-7 text-primary" />
          </div>
          <h3 className="font-semibold text-lg mb-1">No team members</h3>
          <p className="text-sm text-muted-foreground">
            Team members will appear here once they join.
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {members.map((member) => {
            const config = roleConfig(member.role);
            const Icon = config.icon;
            const initials = member.user
              ? `${(member.user.firstName || "")[0] || ""}${(member.user.lastName || "")[0] || ""}`.toUpperCase() || "U"
              : "U";

            return (
              <Card
                key={member.id}
                className="p-4 hover:shadow-sm transition-shadow"
                data-testid={`member-${member.id}`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="h-11 w-11 shadow-sm">
                      <AvatarImage
                        src={member.user?.profileImageUrl || undefined}
                      />
                      <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">
                        {member.user?.firstName} {member.user?.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {member.user?.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {member.role === "owner" ? (
                      <Badge
                        variant={config.variant}
                        className="capitalize"
                      >
                        <Icon className="h-3 w-3 mr-1" />
                        {member.role}
                      </Badge>
                    ) : (
                      <Select
                        value={member.role}
                        onValueChange={(role) =>
                          updateRoleMutation.mutate({
                            memberId: member.id,
                            role,
                          })
                        }
                      >
                        <SelectTrigger
                          className="w-[120px]"
                          data-testid={`select-role-${member.id}`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="member">Member</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
