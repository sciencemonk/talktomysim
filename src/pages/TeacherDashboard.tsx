import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAgents } from "@/hooks/useAgents";
import { ThemeToggle } from "@/components/ThemeToggle";

const TeacherDashboard = () => {
  const [search, setSearch] = useState("");
  const { agents, isLoading, error } = useAgents();

  const filteredAgents = agents.filter((agent) =>
    agent.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">AI Tutors</h2>
        <div className="flex items-center space-x-2">
          <ThemeToggle />
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Input
          placeholder="Search tutors..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button asChild>
          <Link to="/agents/create" variant="brand">
            <Plus className="mr-2 h-4 w-4" />
            Create New
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Tutors List</CardTitle>
          <CardDescription>
            Here's a list of all the AI tutors you've created.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>Loading tutors...</div>
          ) : error ? (
            <div>Error: {error}</div>
          ) : (
            <ScrollArea>
              <Table>
                <TableCaption>
                  A list of your AI tutors. Click on a tutor to view details.
                </TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tutor</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead className="text-right">Students Saved</TableHead>
                    <TableHead className="text-right">Helpfulness</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAgents.map((agent) => (
                    <TableRow key={agent.id}>
                      <TableCell>
                        <Link
                          to={`/agents/${agent.id}`}
                          className="flex items-center space-x-2"
                        >
                          <Avatar>
                            <AvatarImage src={agent.avatar} />
                            <AvatarFallback>
                              <User className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                          <span>{agent.name}</span>
                        </Link>
                      </TableCell>
                      <TableCell>{agent.email}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{agent.type}</Badge>
                      </TableCell>
                      <TableCell>{agent.subject}</TableCell>
                      <TableCell className="text-right">
                        {agent.studentsSaved}
                      </TableCell>
                      <TableCell className="text-right">
                        {agent.helpfulnessScore}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherDashboard;
